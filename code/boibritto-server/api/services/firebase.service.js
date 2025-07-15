import admin from "../config/firebase.config.js";
import { logError } from "../utils/logger.js";

const verifyFirebaseToken = async (authHeader) => {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("no token provided");
  }

  const idToken = authHeader.split("Bearer ")[1];
  if (!idToken) {
    throw new Error("invalid token format");
  }

  const decodedToken = await admin.auth().verifyIdToken(idToken);
  return decodedToken;
};

/**
 * admin email-pass validation is done on
 * on client side with signInWithEmailAndPassword
 *
 * this checks if given admin email exists in firebase auth console
 */
const verifyAdminEmail = async (email) => {
  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    return userRecord;
  } catch (error) {
    logError("Firebase admin getUserByEmail error:", error);
    return null;
  }
};

export { verifyFirebaseToken, verifyAdminEmail };
