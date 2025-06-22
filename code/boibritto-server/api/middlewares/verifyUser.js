import { sendError } from "../utils/response.js";
import HTTP from "../utils/httpStatus.js";
import User from "../models/user.models.js";
import { verifyFirebaseToken } from "../services/firebase.service.js";
import { logError } from "../utils/logger.js";

const verifyUser = async (req, res, next) => {
  try {
    const decodedToken = await verifyFirebaseToken(req.headers.authorization);

    // find the user in db via firebase uid
    const user = await User.findOne({ uid: decodedToken.uid });

    if (!user) {
      return sendError(
        res,
        HTTP.UNAUTHORIZED,
        "unauthorized: user not registered"
      );
    }

    req.user = user;
    next();
  } catch (err) {
    logError("error verifying User ID token:", err);
    return sendError(
      res,
      HTTP.UNAUTHORIZED,
      "unauthorized: invalid or expired token"
    );
  }
};

export default verifyUser;
