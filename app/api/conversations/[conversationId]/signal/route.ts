import getCurrentUser from "@/app/actions/getCurrentUser";
import { pusherServer } from "@/app/libs/pusher";
import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";

const getConversation = async (conversationId: string) => {
  const conversation = await prisma.conversation.findUnique({
    where: {
      id: conversationId,
    },
    include: {
      users: true,
    },
  });

  return conversation;
};

export async function POST(request: Request, { params }: any) {
  const { signal } = await request.json();
  const { conversationId } = params;

  const currentUser = await getCurrentUser();

  if (!currentUser?.id || !currentUser?.email) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  if (!conversationId) {
    return new NextResponse("Invalid ID", { status: 400 });
  }

  const conversation = await getConversation(conversationId);

  conversation?.users.forEach((user) => {
    if (user.email && user.id !== currentUser.id) {
      pusherServer.trigger(user.email, "conversation:signal", {
        signal,
      });
    }
  });

  // Return json response
  return new NextResponse("OK", {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function DELETE(request: Request, { params }: any) {
  const { conversationId } = params;
  const currentUser = await getCurrentUser();

  if (!currentUser?.id || !currentUser?.email) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  if (!conversationId) {
    return new NextResponse("Invalid ID", { status: 400 });
  }

  const conversation = await getConversation(conversationId);

  conversation?.users.forEach((user) => {
    if (user.email && user.id !== currentUser.id) {
      pusherServer.trigger(user.email, "conversation:end-call", {});
    }
  });

  // Return 204 No Content
  return new NextResponse(null, {
    status: 204,
  });
}
