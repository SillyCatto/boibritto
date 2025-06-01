require("dotenv").config();
const admin = require("firebase-admin");

if (!admin.apps.length) {
  if (process.env.FIREBASE_AUTH_EMULATOR_HOST) {
    admin.initializeApp({
      projectId: "boibritto-a27da", // must match emulator config (.firebaserc)
    });
  } else {
    // production mode
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
    });
  }
}

module.exports = admin;
