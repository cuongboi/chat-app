"use client";

import { User } from "@prisma/client";

import UserBox from "./UserBox";
import { useEffect } from "react";
import { pusherClient } from "@/app/libs/pusher";
import clsx from "clsx";
import useConversation from "@/app/hooks/useConversation";

interface UserListProps {
  items: User[];
}

const UserList: React.FC<UserListProps> = ({ items }) => {
  const { isOpen } = useConversation();
  useEffect(() => {
    pusherClient.subscribe("users");
    pusherClient.bind("new-user", (data: any) => {
      items.push(data);
    });

    return () => {
      pusherClient.unsubscribe("users");
      pusherClient.unbind("new-user");
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <aside
      className={clsx(
        `
      fixed
      inset-y-0
      pb-20
      lg:pb-0
      lg:left-20
      lg:w-80
      lg:block
      overflow-y-auto
      border-r
      border-gray-200
    `,
        isOpen ? "hidden" : "block w-full left-0"
      )}
    >
      <div className="px-5">
        <div className="flex-col">
          <div
            className="
              text-2xl
              font-bold
              text-neutral-800
              py-4
            "
          >
            Users
          </div>
        </div>
        {items.map((item) => (
          <UserBox key={item.id} data={item} />
        ))}
      </div>
    </aside>
  );
};

export default UserList;
