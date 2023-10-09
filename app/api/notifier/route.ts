import { beamsClient } from "@/app/libs/beam";
import prisma from "@/app/libs/prismadb";

export async function GET() {
  const conversations = await prisma.conversation.findMany({
    include: {
      users: {
        select: {
          id: true,
          email: true,
          notification: true,
        },
      },
      messages: {
        select: {
          id: true,
          seenIds: true,
          body: true,
          hasNotification: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
    },
  });

  conversations.forEach(async (conversation) => {
    if (conversation.messages.length > 0) {
      const message = conversation.messages[0];
      const seenIds = message.seenIds;
      const unseenUser = conversation.users.find(
        (user) => !seenIds.includes(user.id)
      );
      if (
        !unseenUser ||
        unseenUser.notification === 0 ||
        message.hasNotification
      ) {
        return;
      }

      if (
        unseenUser.notification === 1 ||
        (unseenUser.notification === 2 &&
          message.createdAt.getTime() > Date.now() - 3600000)
      ) {
        await beamsClient
          .publishToInterests([`user-${unseenUser.id}`], {
            web: {
              time_to_live: 3600,
              notification: {
                title: "New message",
                body: "body",
                deep_link:
                  "https://chat-app-delta-two.vercel.app/conversations",
                icon: "https://via.placeholder.com/150",
              },
            },
          })
          .then(async () => {
            await prisma.message.update({
              where: {
                id: message.id,
              },
              data: {
                hasNotification: true,
              },
            });
          });
      }
    }
  });

  return new Response(JSON.stringify({}));
}
