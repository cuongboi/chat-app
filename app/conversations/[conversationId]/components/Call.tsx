import { pusherClient } from "@/app/libs/pusher";
import Peer from "simple-peer";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import Modal from "@/app/components/modals/Modal";
import axios from "axios";
import { useSession } from "next-auth/react";
import EventEmitter from "eventemitter3";
import { MdVideoCameraFront, MdPhoneDisabled } from "react-icons/md";
import useOtherUser from "@/app/hooks/useOtherUser";
import Image from "next/image";

const ShowCall: React.FC<{
  userRef: any;
  remoteRef: any;
  accept: boolean;
}> = ({ userRef, remoteRef, accept }) => {
  const videoClassName = "w-full h-full rounded-md";
  const [userClassName, setUserClassName] = useState<string>("hidden");
  const [remoteClassName, setRemoteClassName] = useState<string>("hidden");

  useEffect(() => {
    if (accept) {
      setUserClassName("absolute w-1/3 right-4 top-4 rounded-md shadow-md");
      setRemoteClassName(videoClassName);
    } else {
      setUserClassName(videoClassName);
      setRemoteClassName("hidden");
    }
  }, [accept]);

  return (
    <div className="relative">
      <video ref={userRef} autoPlay playsInline className={userClassName} />
      <video ref={remoteRef} autoPlay playsInline className={remoteClassName} />
    </div>
  );
};

const Call: React.FC<{
  conversation: any;
}> = ({ conversation }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const session = useSession();
  const [callerSignal, setCallerSignal] = useState<any>(null);
  const [isCaller, setIsCaller] = useState<boolean>(false);
  const [answerSignal, setAnswerSignal] = useState<any>(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const otherUser = useOtherUser(conversation);
  const callPeer = useRef<Peer.Instance | null>(null);
  const answerPeer = useRef<Peer.Instance | null>(null);
  const eventEmitter = useRef<any>(null);
  const pusherKey = useMemo(() => {
    return session.data?.user?.email;
  }, [session.data?.user?.email]);

  useEffect(() => {
    if (!pusherKey) {
      return;
    }

    eventEmitter.current = new EventEmitter();

    eventEmitter.current.on("end-call", () => {
      setIsCaller(false);
      setCallAccepted(false);
      setCallerSignal(null);
      setAnswerSignal(null);
      callPeer.current?.destroy();
      answerPeer.current?.destroy();
      callPeer.current = null;
      answerPeer.current = null;
    });

    const channel = pusherClient.subscribe(pusherKey);
    channel.bind("conversation:signal", ({ signal }: any) => {
      if (signal.type === "offer") {
        setCallerSignal(signal);
      } else {
        setCallAccepted(true);
        setAnswerSignal(signal);
      }
    });

    channel.bind("conversation:end-call", () => {
      setIsCaller(false);
      setCallAccepted(false);
      eventEmitter.current?.emit("end-call");
    });

    return () => {
      pusherClient.unsubscribe(pusherKey);
      channel.unbind("conversation:signal");
      pusherClient.disconnect();
    };
  }, [pusherKey]);

  useEffect(() => {
    if (!answerSignal) {
      return;
    }

    callPeer.current?.signal(answerSignal);
  }, [answerSignal]);

  const answerCall = async () => {
    setCallAccepted(true);
    const stream = await initializeMediaStream();
    answerPeer.current = createPeer(stream, false);
    answerPeer.current.signal(callerSignal);
    answerPeer.current.on("stream", (stream: any) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
    });
  };

  const call = async () => {
    setIsCaller(true);
    const stream = await initializeMediaStream();
    callPeer.current = createPeer(stream, true);
    callPeer.current.on("stream", (stream: any) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
    });
  };

  const initializeMediaStream = async (hasVideo?: boolean) => {
    const userMediaStream = await navigator.mediaDevices.getUserMedia({
      video: hasVideo || true,
      audio: true,
    });

    eventEmitter.current.on("end-call", () => {
      userMediaStream.getTracks().forEach((track: any) => {
        track.stop();
      });
    });

    if (videoRef.current) {
      videoRef.current.srcObject = userMediaStream;
    }

    return userMediaStream;
  };

  const createPeer = (stream: any, isInit: boolean) => {
    const peer = new Peer({
      initiator: isInit,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal: any) => {
      axios.post(`/api/conversations/${conversation.id}/signal`, {
        signal,
      });
    });

    return peer;
  };

  const endCall = () => {
    setIsCaller(false);
    setCallAccepted(false);
    setCallerSignal(null);
    setAnswerSignal(null);
    eventEmitter.current?.emit("end-call");
    axios.delete(`/api/conversations/${conversation.id}/signal`, {});
  };

  if (!pusherKey) {
    return null;
  }

  return (
    <div>
      {(isCaller || callerSignal !== null) && (
        <Modal isOpen={true} onClose={() => void 0} showCloseButton={false}>
          <div className="w-full aspect-auto relative overflow-hidden">
            {isCaller || callAccepted ? (
              <>
                <ShowCall
                  userRef={videoRef}
                  remoteRef={remoteVideoRef}
                  accept={callAccepted}
                />
                <div className="absolute flex w-full justify-center bottom-5">
                  <button
                    type="button"
                    className="w-12 h-12 flex justify-center items-center text-white bg-red-500 border-transparent rounded-full btn hover:bg-red-600"
                    onClick={endCall}
                  >
                    <span className="text-xl bg-transparent">
                      <MdPhoneDisabled size={24} />
                    </span>
                  </button>
                </div>
              </>
            ) : (
              <>
                {callerSignal && (
                  <div className="p-4 text-center">
                    <div className="mb-6">
                      <Image
                        src={otherUser?.image! || "/images/avatar.png"}
                        alt=""
                        className="w-24 h-24 mx-auto rounded-full"
                        width={96}
                        height={96}
                      />
                    </div>

                    <h5 className="mb-1 truncate text-gray-800">
                      {otherUser?.name}
                    </h5>
                    <p className="text-gray-500">Start Video Call</p>

                    <div className="mt-10">
                      <ul className="flex justify-center mb-1">
                        <li className="px-2 ml-0 mr-2">
                          <button
                            onClick={answerCall}
                            type="button"
                            className="w-12 h-12 flex justify-center items-center text-white bg-green-500 border-transparent rounded-full btn hover:bg-green-600"
                          >
                            <span className="text-xl bg-transparent">
                              <MdVideoCameraFront size={24} />
                            </span>
                          </button>
                        </li>
                        <li className="px-2">
                          <button
                            type="button"
                            className="w-12 h-12 flex justify-center items-center text-white bg-red-500 border-transparent rounded-full btn hover:bg-red-600"
                            onClick={endCall}
                          >
                            <span className="text-xl bg-transparent">
                              <MdPhoneDisabled size={24} />
                            </span>
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </Modal>
      )}

      <button
        onClick={call}
        type="button"
        className="w-12 h-12 flex justify-center items-center text-sky-500"
      >
        <span className="text-xl bg-transparent">
          <MdVideoCameraFront size={24} />
        </span>
      </button>
    </div>
  );
};

export default memo(Call);
