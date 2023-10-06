const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
});

global.firestore = global.firestore || admin.firestore();
global.firebaseAdmin = global.firebaseAdmin || admin;
