const AdminModel = require("../models/admin.models");
const { sendError } = require("../utils/response");
const HTTP = require("../utils/httpStatus");
const { verifyFirebaseToken } = require("../services/firebase.service");
const { logWarning, logError } = require("../utils/logger");

const verifyAdmin = async (req, res, next) => {
  try {
    const decodedToken = await verifyFirebaseToken(req.headers.authorization);
    const { uid, email, name } = decodedToken;

    if (!uid || !email || !name) {
      logWarning("invalid token payload", decodedToken);
      return sendError(res, HTTP.UNAUTHORIZED, "unauthorized");
    }

    // check if admin exist in db
    const admin = await AdminModel.findOne({ uid, email, name });

    if (!admin) {
      logWarning("admin not registered");
      return sendError(res, HTTP.UNAUTHORIZED, "unauthorized");
    }

    req.admin = admin;
    next();
  } catch (err) {
    logError("error verifying Admin ID token:", err);
    return sendError(res, HTTP.UNAUTHORIZED, "unauthorized");
  }
};

module.exports = verifyAdmin;
