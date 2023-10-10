importScripts("https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js");
importScripts(
  "https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js"
);

const firebaseConfig = {
  apiKey: "AIzaSyD1aVPu4Ge3yiqRTReqxtbcX-UbU7ysr0A",
  authDomain: "ctradesys.firebaseapp.com",
  projectId: "ctradesys",
  storageBucket: "ctradesys.appspot.com",
  messagingSenderId: "455107409240",
  appId: "1:455107409240:web:97fcc7f62027a0dabaa12d",
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("Message received. ", payload);
  // Customize how you want to handle background notifications
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
