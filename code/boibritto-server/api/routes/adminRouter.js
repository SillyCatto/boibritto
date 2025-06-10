const express = require("express");
const adminRouter = express.Router();
const User = require("../models/user.models");

const { sendSuccess, sendError } = require("../utils/response");
const HTTP = require("../utils/httpStatus");

// get all users
adminRouter.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    return sendSuccess(res, HTTP.OK, "Fetched all users", { users });
  } catch (error) {
    return sendError(
      res,
      HTTP.INTERNAL_SERVER_ERROR,
      "Failed to fetch users",
      error,
    );
  }
});

module.exports = adminRouter;
