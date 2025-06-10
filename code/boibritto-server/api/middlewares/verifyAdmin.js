const admin = require("../config/firebase");
const AdminModel = require("../models/admin.models");
const { sendError } = require("../utils/response");
const HTTP = require("../utils/httpStatus");

const verifyAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return sendError(
        res,
        HTTP.UNAUTHORIZED,
        "unauthorized: token missing or invalid",
      );
    }

    const idToken = authHeader.split(" ")[1];

    // verify firebase token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name } = decodedToken;

    if (!uid || !email || !name) {
      console.error("invalid token payload");
      return sendError(res, HTTP.UNAUTHORIZED, "unauthorized");
    }

    // check if admin exist in db
    const adminInDb = await AdminModel.findOne({ uid, email, name });

    if (!adminInDb) {
      console.error("admin not registered");
      return sendError(res, HTTP.UNAUTHORIZED, "unauthorized");
    }

    req.admin = adminInDb;
    next();
  } catch (error) {
    return sendError(
      res,
      HTTP.UNAUTHORIZED,
      "Unauthorized: invalid token or internal error",
      error,
    );
  }
};

module.exports = verifyAdmin;
