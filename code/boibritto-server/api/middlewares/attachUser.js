const { verifyFirebaseToken } = require("../services/firebase.service");
const { sendError } = require("../utils/response");
const HTTP = require("../utils/httpStatus");
const { logError } = require("../utils/logger");

const attachUser = async (req, res, next) => {
  try {
    const decodedToken = await verifyFirebaseToken(req.headers.authorization);
    req.user = decodedToken;
    next();
  } catch (err) {
    logError("Attaching user failed", err);
    return sendError(res, HTTP.UNAUTHORIZED, "unauthorized");
  }
};

module.exports = attachUser;
