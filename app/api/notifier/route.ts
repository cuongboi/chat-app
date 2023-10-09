import prisma from "@/app/libs/prismadb";

export async function GET() {
  const conversations = await prisma.conversation.findMany({
    include: {
      users: {
        select: {
          id: true,
          email: true,
          notification: true,
          deviceToken: true,
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

  const pushNotificationList: any[] = [];

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
        pushNotificationList.push({
          user: unseenUser,
          message: message.id,
        });
      }
    }
  });

  if (pushNotificationList.length > 0) {
    const message = firebaseAdmin.messaging();
    const tokens: string[] = [];

    pushNotificationList.forEach((item) => {
      tokens.concat(item.user.deviceToken || []);
    });

    const payload = {
      notification: {
        title: "New message",
        body: "You have a new message",
        icon: "https://via.placeholder.com/150",
      },
      data: {
        messageId: pushNotificationList[0].message,
      },
    };

    await message.sendToDevice(tokens, payload, {
      priority: "high",
      timeToLive: 60 * 60,
    });
  }

  return new Response(JSON.stringify({}));
}
