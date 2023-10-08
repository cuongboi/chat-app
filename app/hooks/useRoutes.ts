import { useMemo } from "react";
import { HiChat } from "react-icons/hi";
import { HiArrowLeftOnRectangle, HiUsers } from "react-icons/hi2";
import { signOut } from "next-auth/react";
import { create } from "zustand";

export const useRouteState = create<{
  path: string;
  setPath: (path: string) => void;
}>((set) => ({
  path: "/conversations",
  setPath: (path) => set({ path }),
}));

const useRoutes = () => {
  const { path, setPath } = useRouteState();

  const routes = useMemo(
    () => [
      {
        label: "Chat",
        icon: HiChat,
        onClick: () => setPath("/conversations"),
        active: path === "/conversations",
      },
      {
        label: "Users",
        icon: HiUsers,
        onClick: () => setPath("/users"),
        active: path === "/users",
      },
      {
        label: "Logout",
        onClick: () => signOut(),
        href: "#",
        icon: HiArrowLeftOnRectangle,
      },
    ],
    [path]
  );

  return routes;
};

export default useRoutes;
