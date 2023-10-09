import { Conversation, Message, User } from "@prisma/client";
import type { initializeApp } from "firebase-admin";

export type FullMessageType = Message & {
  sender: User;
  seen: User[];
};

export type FullConversationType = Conversation & {
  users: User[];
  messages: FullMessageType[];
};

// type global for firebaseAdmin
declare namespace NodeJS {
  interface Global {
    firebaseAdmin: ReturnType<typeof initializeApp>;
  }
}

declare global {
  var firebaseAdmin: ReturnType<typeof initializeApp>;
}
