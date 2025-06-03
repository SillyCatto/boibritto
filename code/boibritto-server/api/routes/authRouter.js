const express = require("express");
const router = express.Router();
const User = require("../models/user.models");
const { sendSuccess, sendError } = require("../utils/response");
const verifyFirebaseToken = require("../middlewares/verifyFirebaseToken");


router.get("/login", verifyFirebaseToken, async (req, res) => {
  try {
    const isExisting = await User.findOne({ uid: req.user.uid });

    const data = {
      newUser: !isExisting,
      user: isExisting || null,
    }

    return sendSuccess(res, 200, "User login successful", data);
  } catch (err) {
    return sendError(res, 500, "Failed to login user", err);
  }
});


router.post("/signup", verifyFirebaseToken, async (req, res) => {
  try {
    const { username, bio, interestedGenres = [] } = req.body;

    const isExisting = await User.findOne({ uid: req.user.uid });
    if (isExisting) {
      return sendError(res, 400, "User already exists");
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
    return sendSuccess(res, 201, "User account created successfully", { user: newUser });
  } catch (err) {
    return sendError(res, 500, "Failed to sign up user", err);
  }
});

module.exports = router;
