import { useParams } from "next/navigation";
import { useMemo } from "react";
import { create } from "zustand";

export const useSendingMessageState = create<{
  message: string[];
  state: "idle" | "pending" | "success" | "error";
  setMessage: (message: string[]) => void;
  setState: (state: "idle" | "pending" | "success" | "error") => void;
}>((set) => ({
  message: [],
  state: "idle",
  setMessage: (message) => set({ message }),
  setState: (state) => set({ state }),
}));

const useConversation = () => {
  const params = useParams();

  const conversationId = useMemo(() => {
    if (!params?.conversationId) {
      return "";
    }

    return params.conversationId as string;
  }, [params?.conversationId]);

  const isOpen = useMemo(() => !!conversationId, [conversationId]);

  return useMemo(
    () => ({
      isOpen,
      conversationId,
    }),
    [isOpen, conversationId]
  );
};

export default useConversation;
