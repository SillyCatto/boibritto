const { sendError } = require("../utils/response");
const HTTP = require("../utils/httpStatus");
const User = require("../models/user.models");
const { verifyFirebaseToken } = require("../services/firebase.service");
const { logError } = require("../utils/logger");

const verifyUser = async (req, res, next) => {
  try {
    const decodedToken = await verifyFirebaseToken(req.headers.authorization);

    // find the user in db via firebase uid
    const user = await User.findOne({ uid: decodedToken.uid });

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
    logError("error verifying User ID token:", err);
    return sendError(
      res,
      HTTP.UNAUTHORIZED,
      "unauthorized: invalid or expired token",
    );
  }
};

module.exports = verifyUser;
