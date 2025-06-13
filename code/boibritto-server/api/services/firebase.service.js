const admin = require("../config/firebase");

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

module.exports = { verifyFirebaseToken };
