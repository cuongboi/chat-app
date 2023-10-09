import "./globals.css";
import AuthContext from "./context/AuthContext";
import ActiveStatus from "./components/ActiveStatus";
import ToasterContext from "./context/ToasterContext";
import { PusherNotification } from "./context/PusherNotification";
import Script from "next/script";

export const metadata = {
  title: "Messenger",
  description: "Messenger Clone",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthContext>
          <ToasterContext />
          <ActiveStatus />
          <PusherNotification />
          {children}
        </AuthContext>
      </body>
    </html>
  );
}
