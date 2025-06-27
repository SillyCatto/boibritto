import HTTP from "../utils/httpStatus.js";
import User from "../models/user.models.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { logError } from "../utils/logger.js";

const loginUser = async (req, res) => {
  try {
    const existingUser = await User.findOne({ uid: req.user.uid });

    const data = {
      newUser: !existingUser,
      user: existingUser || null,
    };

    return sendSuccess(res, HTTP.OK, "User login successful", data);
  } catch (err) {
    logError("User login failed", err);
    return sendError(res, HTTP.INTERNAL_SERVER_ERROR, "Failed to login user");
  }
};

const signupUser = async (req, res) => {
  try {
    const { username, bio, interestedGenres = [] } = req.body.data;

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
    logError("User signup failed", err);
    return sendError(res, HTTP.INTERNAL_SERVER_ERROR, "Failed to sign up user");
  }
};

export const AuthController = {
  loginUser,
  signupUser,
};
