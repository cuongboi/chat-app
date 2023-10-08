"use client";

import { memo, useEffect, useMemo, useRef, useState } from "react";
import Modal from "@/app/components/modals/Modal";
import { useSession } from "next-auth/react";
import EventEmitter from "eventemitter3";
import { MdVideoCameraFront, MdPhoneDisabled } from "react-icons/md";
import useOtherUser from "@/app/hooks/useOtherUser";
import Image from "next/image";

enum CallStatus {
  REQUEST = "REQUEST",
  ACCEPT = "ACCEPT",
  CANCEL = "CANCEL",
}

type VideoCallOptions = {
  video: boolean;
  audio: boolean;
};

const ShowCall: React.FC<{
  userRef: any;
  remoteRef: any;
  options: VideoCallOptions;
}> = ({ userRef, remoteRef, options }) => {
  return (
    <div className="relative">
      <video
        ref={userRef}
        autoPlay
        playsInline
        className="absolute w-1/3 right-4 top-4 border border-gray-700 rounded-md shadow-md"
      />
      <video
        ref={remoteRef}
        autoPlay
        playsInline
        className="w-full h-full rounded-md shadow-md"
      />
    </div>
  );
};

const Call: React.FC<{
  conversation: any;
}> = ({ conversation }) => {
  const { data: session } = useSession();
  const myVideoRef = useRef<HTMLVideoElement | undefined>();
  const peerVideoRef = useRef<HTMLVideoElement | undefined>();
  const myStream = useRef<MediaStream | undefined>();
  const eventEmitter = useMemo(() => new EventEmitter(), []);
  const otherUser = useOtherUser(conversation);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [isWaiting, setIsWaiting] = useState<boolean>(false);
  const [isCalling, setIsCalling] = useState<boolean>(false);
  const [isMyCall, setIsMyCall] = useState<boolean>(false);
  const [callOptions, setCallOptions] = useState<VideoCallOptions>({
    video: true,
    audio: true,
  });
  const peer = useMemo(() => {
    if (!session?.user?.id) {
      return;
    }

    const Peer = require("peerjs").default;
    const peer = new Peer(session?.user?.id);

    peer.on("open", () => {
      setIsReady(true);
    });

    peer.on("connection", (connect: any) => {
      createEvent(connect);
    });

    peer.on("call", async (call: any) => {
      myStream.current = await getStream(callOptions);
      if (myVideoRef.current) {
        myVideoRef.current.srcObject = myStream.current;
      }
      call.answer(myStream.current); // Answer the call with an A/V stream.
      call.on("stream", function (remoteStream: MediaStream) {
        if (remoteStream && peerVideoRef.current) {
          peerVideoRef.current!.srcObject = remoteStream;
        }
      });
    });

    return peer;
  }, [session?.user?.id]);

  const createEvent = (connect: any) => {
    eventEmitter.once(CallStatus.ACCEPT, async () => {
      connect.send({
        type: CallStatus.ACCEPT,
      });
      setIsWaiting(false);
      setIsCalling(true);
    });

    eventEmitter.once(CallStatus.CANCEL, () => {
      connect.send({
        type: CallStatus.CANCEL,
      });
      endCall();
    });

    connect.on("data", async (data: any) => {
      console.log(data);
      switch (data.type) {
        case CallStatus.REQUEST:
          setCallOptions(data.options);
          setIsWaiting(true);
          break;
        case CallStatus.ACCEPT:
          setIsWaiting(false);
          setIsCalling(true);
          myStream.current = await getStream(callOptions);

          if (myVideoRef.current) {
            myVideoRef.current.srcObject = myStream.current;
          }

          const call = peer.call(otherUser.id, myStream.current);
          call.on("stream", (remoteStream: any) => {
            if (peerVideoRef.current && remoteStream) {
              peerVideoRef.current!.srcObject = remoteStream;
            }
          });
          break;
        case CallStatus.CANCEL:
          endCall();
          break;
        default:
          break;
      }
    });
  };

  const getStream = async (options: VideoCallOptions) => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: options?.video || true,
      audio: options?.audio || true,
    });

    return stream;
  };

  const call = (options: VideoCallOptions) => {
    const connect = peer.connect(otherUser.id);
    connect.on("open", () => {
      connect.send({
        type: CallStatus.REQUEST,
        options,
      });

      createEvent(connect);
    });
    setCallOptions(options);
    setIsWaiting(true);
    setIsMyCall(true);
  };

  const endCall = () => {
    setIsWaiting(false);
    setIsCalling(false);
    setIsMyCall(false);
    setCallOptions({
      video: true,
      audio: true,
    });
    myStream.current?.getTracks().forEach((track) => {
      track.stop();
    });
  };

  return (
    <div>
      {(isCalling || isWaiting) && (
        <Modal isOpen={true} onClose={() => void 0} showCloseButton={false}>
          <div className="w-full aspect-auto relative overflow-hidden">
            {isCalling && (
              <>
                <ShowCall
                  userRef={myVideoRef}
                  remoteRef={peerVideoRef}
                  options={callOptions}
                />
                <div className="absolute flex w-full justify-center bottom-5">
                  <button
                    type="button"
                    className="w-12 h-12 flex justify-center items-center text-white bg-red-500 border-transparent rounded-full btn hover:bg-red-600"
                    onClick={() => eventEmitter.emit(CallStatus.CANCEL)}
                  >
                    <span className="text-xl bg-transparent">
                      <MdPhoneDisabled size={24} />
                    </span>
                  </button>
                </div>
              </>
            )}

            {isWaiting && (
              <div className="p-4 text-center">
                <div className="mb-6">
                  <Image
                    src={otherUser?.image || "/images/placeholder.jpg"}
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
                    {!isMyCall && (
                      <li className="px-2 ml-0 mr-2">
                        <button
                          onClick={() => eventEmitter.emit(CallStatus.ACCEPT)}
                          type="button"
                          className="w-12 h-12 flex justify-center items-center text-white bg-green-500 border-transparent rounded-full btn hover:bg-green-600"
                        >
                          <span className="text-xl bg-transparent">
                            <MdVideoCameraFront size={24} />
                          </span>
                        </button>
                      </li>
                    )}

                    <li className="px-2">
                      <button
                        type="button"
                        className="w-12 h-12 flex justify-center items-center text-white bg-red-500 border-transparent rounded-full btn hover:bg-red-600"
                        onClick={() => eventEmitter.emit(CallStatus.CANCEL)}
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
          </div>
        </Modal>
      )}
      {isReady && (
        <button
          onClick={() => {
            call({
              video: true,
              audio: true,
            });
          }}
          type="button"
          className="w-12 h-12 flex justify-center items-center text-sky-500"
        >
          <span className="text-xl bg-transparent">
            <MdVideoCameraFront size={24} />
          </span>
        </button>
      )}
    </div>
  );
};

export default memo(Call);
