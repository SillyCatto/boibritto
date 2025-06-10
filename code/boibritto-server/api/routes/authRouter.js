const express = require("express");
const router = express.Router();
const HTTP = require("../utils/httpStatus");
const User = require("../models/user.models");
const { sendSuccess, sendError } = require("../utils/response");
const verifyFirebaseToken = require("../middlewares/verifyFirebaseToken");

router.get("/login", verifyFirebaseToken, async (req, res) => {
  try {
    const existingUser = await User.findOne({ uid: req.user.uid });

    const data = {
      newUser: !existingUser,
      user: existingUser || null,
    };

    return sendSuccess(res, HTTP.OK, "User login successful", data);
  } catch (err) {
    return sendError(
      res,
      HTTP.INTERNAL_SERVER_ERROR,
      "Failed to login user",
      err,
    );
  }
});

router.post("/signup", verifyFirebaseToken, async (req, res) => {
  try {
    const { username, bio, interestedGenres = [] } = req.body;

    const existingUser = await User.findOne({ uid: req.user.uid });
    if (existingUser) {
      return sendError(res, HTTP.BAD_REQUEST, "User already exists");
    }

    const newUser = new User({
      uid: req.user.uid,
      email: req.user.email,
      displayName: req.user.name,
      avatar: req.user.picture,
      username,
      bio,
      interestedGenres,
    });

    await newUser.save();
    return sendSuccess(res, HTTP.CREATED, "User account created successfully", {
      user: newUser,
    });
  } catch (err) {
    return sendError(
      res,
      HTTP.INTERNAL_SERVER_ERROR,
      "Failed to sign up user",
      err,
    );
  }
});

module.exports = router;
