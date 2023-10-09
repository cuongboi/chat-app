"use client";

import React from "react";
import { Client } from "@pusher/push-notifications-web";
import { useSession } from "next-auth/react";

export const PusherNotification = () => {
  const session = useSession();

  React.useEffect(() => {
    if (!session.data?.user?.email) {
      return;
    }

    try {
      const beamsClient = new Client({
        instanceId: process.env.NEXT_PUBLIC_PUSHER_BEAMS_INSTANCE_ID!,
      });

      beamsClient
        .start()
        .then(() =>
          beamsClient.addDeviceInterest(`user-${session.data?.user?.id!}`)
        )
        .then(() => console.log("Successfully registered and subscribed!"))
        .catch(console.error);
    } catch (error) {
      // eslint-disable-next-line no-console
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.data?.user?.email]);

  return null;
};
