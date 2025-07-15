import { verifyFirebaseToken } from "../services/firebase.service.js";
import { sendError } from "../utils/response.js";
import HTTP from "../utils/httpStatus.js";
import { logError } from "../utils/logger.js";

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

export default attachUser;
