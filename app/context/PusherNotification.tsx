"use client";

import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import * as firebase from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import axios from "axios";
import { toast } from "react-hot-toast";

export const PusherNotification = () => {
  const session = useSession();

  useEffect(() => {
    firebase.initializeApp({
      apiKey: "AIzaSyD1aVPu4Ge3yiqRTReqxtbcX-UbU7ysr0A",
      authDomain: "ctradesys.firebaseapp.com",
      projectId: "ctradesys",
      storageBucket: "ctradesys.appspot.com",
      messagingSenderId: "455107409240",
      appId: "1:455107409240:web:97fcc7f62027a0dabaa12d",
    });
  }, []);

  React.useEffect(() => {
    if (!session.data?.user?.email) {
      return;
    }

    const initial = async () => {
      try {
        const messaging = getMessaging();

        onMessage(messaging, (payload: any) => {
          console.log("Message received. ", payload);
          toast.success(payload.notification.body, {
            duration: 5000,
          });
        });

        getToken(messaging, {
          vapidKey:
            "BMNMRXHU7Q35RI_pACh5Z7UsGSISvtrb87RO_HfJYmfkbNbmebaLdDCRkhJaCm01eDeGf5QQe0ayALO4JXtWmqo",
        })
          .then((currentToken) => {
            console.log("currentToken:", currentToken);
            // set token to user document
            axios.put("/api/settings", {
              deviceToken: [currentToken],
            });
          })
          .catch((err) => {
            console.log("An error occurred while retrieving token. ", err);
          });
      } catch (error) {
        console.error("Error requesting notification permission:", error);
      }
    };

    initial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.data?.user?.email]);

  return null;
};
