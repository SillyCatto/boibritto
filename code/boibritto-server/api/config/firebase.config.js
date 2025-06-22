import "dotenv/config";
import admin from "firebase-admin";

const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY || "";

// Safe handling to avoid null/undefined errors
const formattedPrivateKey =
  rawPrivateKey && rawPrivateKey.includes("\\n")
    ? rawPrivateKey.replace(/\\n/g, "\n")
    : rawPrivateKey;

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
        privateKey: formattedPrivateKey,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
    });
  }
}

export default admin;
