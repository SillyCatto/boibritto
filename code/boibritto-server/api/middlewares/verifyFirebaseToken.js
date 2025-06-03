const admin = require("../config/firebase");
const { sendError } = require("../utils/response");

const verifyFirebaseToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return sendError(res, 401, "unauthorized: no token provided");
  }

  const idToken = authHeader.split("Bearer ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (err) {
    console.error("error verifying firebase ID token:", err);
    return sendError(res, 401, "unauthorized: invalid or expired token", err);
  }
};

module.exports = verifyFirebaseToken;
