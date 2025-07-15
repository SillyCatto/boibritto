import express from "express";
const adminRoute = express.Router();
import User from "../models/user.models.js";

import { sendSuccess, sendError } from "../utils/response.js";
import HTTP from "../utils/httpStatus.js";
import { logError } from "../utils/logger.js";

// get all users
adminRoute.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    return sendSuccess(res, HTTP.OK, "Fetched all users", { users });
  } catch (err) {
    logError("Failed to fetch users", err);
    return sendError(res, HTTP.INTERNAL_SERVER_ERROR, "Failed to fetch users");
  }
});

export default adminRoute;
