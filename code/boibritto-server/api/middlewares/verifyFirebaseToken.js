const admin = require("../config/firebase");
const { sendError } = require("../utils/response");
const HTTP = require("../utils/httpStatus");
const User = require("../models/user.models");

const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return sendError(
        res,
        HTTP.UNAUTHORIZED,
        "unauthorized: no token provided",
      );
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    // find the user in db via firebase uid
    let user = await User.findOne({ uid: decodedToken.uid });

    if (!user) {
      return sendError(
        res,
        HTTP.UNAUTHORIZED,
        "unauthorized: user not registered",
      );
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("error verifying firebase ID token:", err);
    return sendError(
      res,
      HTTP.UNAUTHORIZED,
      "unauthorized: invalid or expired token",
    );
  }
};

module.exports = verifyFirebaseToken;
