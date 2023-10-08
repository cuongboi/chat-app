import prisma from "@/app/libs/prismadb";
import getSession from "./getSession";

const getLastConversation = async () => {
  const session = await getSession();

  if (!session?.user?.id) {
    return null;
  }

  const conversation = await prisma.conversation.findFirst({
    where: {
      users: {
        some: {
          id: session?.user?.id,
        },
      },
    },
    orderBy: {
      lastMessageAt: "desc",
    },
  });

  return conversation;
};

export default getLastConversation;
