import PusherServer from "pusher";
import PusherClient from "pusher-js";

declare global {
  var pusherClient: PusherClient | undefined;
  var pusherServer: PusherServer | undefined;
}

if (!globalThis.pusherClient) {
  globalThis.pusherClient = new PusherClient(
    process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
    {
      channelAuthorization: {
        endpoint: "/api/pusher/auth",
        transport: "ajax",
      },
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    }
  );
}

if (!globalThis.pusherServer) {
  globalThis.pusherServer = new PusherServer({
    appId: process.env.PUSHER_APP_ID!,
    key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
    secret: process.env.PUSHER_SECRET!,
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    useTLS: true,
  });
}

export const pusherClient = globalThis.pusherClient;
export const pusherServer = globalThis.pusherServer;
