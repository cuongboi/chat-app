"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { IoClose, IoTrash } from "react-icons/io5";
import { Conversation, User } from "@prisma/client";
import { format } from "date-fns";

import useOtherUser from "@/app/hooks/useOtherUser";
import useActiveList from "@/app/hooks/useActiveList";

import Avatar from "@/app/components/Avatar";
import AvatarGroup from "@/app/components/AvatarGroup";
import ConfirmModal from "./ConfirmModal";
import { create } from "zustand";
import { isMobile } from "react-device-detect";

export const useProfileColumn = create<{
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  toggle: () => void;
  close: () => void;
}>((set) => ({
  isOpen: true,
  setIsOpen: (isOpen: boolean) => set({ isOpen }),
  toggle: () =>
    set((state: { isOpen: boolean }) => ({ isOpen: !state.isOpen })),
  close: () => set({ isOpen: false }),
}));

export const ProfileDivider: React.FC<{
  children: React.ReactNode;
}> = (props: any) => {
  const { isOpen } = useProfileColumn();
  return (
    <div
      className={`lg:pl-80 h-full transition ease-in-out duration-100  ${
        isOpen ? "lg:pr-96" : "w-full pr-0"
      }`}
    >
      {props.children}
    </div>
  );
};

const ProfileColumn: React.FC<{
  data: Conversation & {
    users: User[];
  };
}> = ({ data }) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const otherUser = useOtherUser(data);
  const { isOpen, close, setIsOpen } = useProfileColumn();

  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  }, [isMobile]);

  const joinedDate = useMemo(() => {
    return format(new Date(otherUser.createdAt), "PP");
  }, [otherUser.createdAt]);

  const title = useMemo(() => {
    return data.name || otherUser.name;
  }, [data.name, otherUser.name]);

  const { members } = useActiveList();
  const isActive = members.indexOf(otherUser?.email!) !== -1;

  const statusText = useMemo(() => {
    if (data.isGroup) {
      return `${data.users.length} members`;
    }

    return isActive ? "Active" : "Offline";
  }, [data, isActive]);

  return (
    <div
      className={`h-full fixed right-0 top-0 border-l border-gray-200 transition ease-in-out duration-100 ${
        isOpen ? "block w-full lg:w-96" : "w-0"
      }`}
    >
      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
      />
      <div className="flex h-full flex-col overflow-y-scroll bg-white py-6">
        <div className="px-4 sm:px-6 ">
          <div className="flex md:hidden items-start justify-end">
            <div className="ml-3 flex h-7 items-center">
              <button
                type="button"
                className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                onClick={close}
              >
                <span className="sr-only">Close panel</span>
                <IoClose size={24} aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
        <div className="relative mt-6 flex-1 px-4 sm:px-6">
          <div className="flex flex-col items-center">
            <div className="mb-2">
              {data.isGroup ? (
                <AvatarGroup users={data.users} />
              ) : (
                <Avatar user={otherUser} />
              )}
            </div>
            <div>{title}</div>
            <div className="text-sm text-gray-500">{statusText}</div>
            <div className="flex gap-10 my-8">
              <div
                onClick={() => setConfirmOpen(true)}
                className="flex flex-col gap-3 items-center cursor-pointer hover:opacity-75"
              >
                <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center">
                  <IoTrash size={20} />
                </div>
                <div className="text-sm font-light text-neutral-600">
                  Delete
                </div>
              </div>
            </div>
            <div className="w-full pb-5 pt-5 sm:px-0 sm:pt-0">
              <dl className="space-y-8 px-4 sm:space-y-6 sm:px-6">
                {data.isGroup && (
                  <div>
                    <dt
                      className="
                                  text-sm
                                  font-medium
                                  text-gray-500
                                  sm:w-40
                                  sm:flex-shrink-0
                                "
                    >
                      Emails
                    </dt>
                    <dd
                      className="
                                  mt-1
                                  text-sm
                                  text-gray-900
                                  sm:col-span-2
                                "
                    >
                      {data.users.map((user: User) => user.email).join(", ")}
                    </dd>
                  </div>
                )}
                {!data.isGroup && (
                  <div>
                    <dt
                      className="
                                  text-sm
                                  font-medium
                                  text-gray-500
                                  sm:w-40
                                  sm:flex-shrink-0
                                "
                    >
                      Email
                    </dt>
                    <dd
                      className="
                                  mt-1
                                  text-sm
                                  text-gray-900
                                  sm:col-span-2
                                "
                    >
                      {otherUser.email}
                    </dd>
                  </div>
                )}
                {!data.isGroup && (
                  <>
                    <hr />
                    <div>
                      <dt
                        className="
                                    text-sm
                                    font-medium
                                    text-gray-500
                                    sm:w-40
                                    sm:flex-shrink-0
                                  "
                      >
                        Joined
                      </dt>
                      <dd
                        className="
                                    mt-1
                                    text-sm
                                    text-gray-900
                                    sm:col-span-2
                                  "
                      >
                        <time dateTime={joinedDate}>{joinedDate}</time>
                      </dd>
                    </div>
                  </>
                )}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileColumn;
