"use client";
import React from "react";
import { useRouteState } from "@/app/hooks/useRoutes";
import { FullConversationType } from "@/app/types";
import { User } from "@prisma/client";
import ConversationList from "./ConversationList";
import UserList from "@/app/users/components/UserList";

interface SubSideBarProps {
  initialItems: FullConversationType[];
  users: User[];
  children: React.ReactNode;
}

const SubSideBar: React.FC<SubSideBarProps> = ({
  initialItems,
  users,
  children,
}) => {
  const { path } = useRouteState();

  return (
    <div className="h-full">
      {path === "/conversations" && (
        <ConversationList
          users={users}
          title="Messages"
          initialItems={initialItems}
        />
      )}
      {path === "/users" && <UserList items={users} />}
      {children}
    </div>
  );
};

export default SubSideBar;
