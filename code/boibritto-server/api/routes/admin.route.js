const express = require("express");
const adminRoute = express.Router();
const User = require("../models/user.models");

const { sendSuccess, sendError } = require("../utils/response");
const HTTP = require("../utils/httpStatus");
const { logError } = require("../utils/logger");

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

module.exports = adminRoute;
