import User from '../models/user.models.js';
import Collection from '../models/collection.models.js';
import ReadingList from '../models/readingList.models.js';
import Blog from '../models/blog.models.js';
import HTTP from '../utils/httpStatus.js';
import {  sendSuccess, sendError  } from '../utils/response.js';
import {  logError  } from '../utils/logger.js';

const getCurrentProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    // exclude sensitive fields
    const user = await User.findById(userId).select("-__v -uid");
    if (!user) {
      return sendError(res, HTTP.NOT_FOUND, "User not found");
    }

    // fetch minimal preview data for user content, most recent 5 items

    const collections = await Collection.find({ user: userId })
      .select("title description visibility createdAt updatedAt")
      .sort({ updatedAt: -1 })
      .limit(5);

    const readingTracker = await ReadingList.find({ user: userId })
      .select("volumeId status visibility createdAt updatedAt")
      .sort({ updatedAt: -1 })
      .limit(5);

    const blogs = await Blog.find({ user: userId })
      .select("title genres visibility spoilerAlert createdAt updatedAt")
      .sort({ updatedAt: -1 })
      .limit(5);

    return sendSuccess(res, HTTP.OK, "Profile data fetched successfully", {
      profile_data: user,
      collections,
      reading_tracker: readingTracker,
      blogs,
    });
  } catch (err) {
    logError("Failed to fetch profile data", err);
    return sendError(
      res,
      HTTP.INTERNAL_SERVER_ERROR,
      "Failed to fetch profile data"
    );
  }
};


const updateCurrentProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { data } = req.body;

    if (!data || typeof data !== "object") {
      return sendError(res, HTTP.BAD_REQUEST, "No profile data provided");
    }

    // Only allow specific fields
    const allowedFields = ["username", "bio", "interestedGenres"];
    const update = {};
    for (const field of allowedFields) {
      if (data[field] !== undefined) update[field] = data[field];
    }

    if (Object.keys(update).length === 0) {
      return sendError(res, HTTP.BAD_REQUEST, "No valid fields to update");
    }

    // validate interestedGenres as an array
    if (
      update.interestedGenres &&
      !Array.isArray(update.interestedGenres)
    ) {
      return sendError(res, HTTP.BAD_REQUEST, "interestedGenres must be an array");
    }

    // username uniqueness check
    if (update.username) {
      const existing = await User.findOne({ username: update.username, _id: { $ne: userId } });
      if (existing) {
        return sendError(res, HTTP.CONFLICT, "Username already taken");
      }
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: update },
      { new: true, runValidators: true }
    );

    if (!user) {
      return sendError(res, HTTP.NOT_FOUND, "User not found");
    }

    return sendSuccess(res, HTTP.OK, "Profile updated successfully", {
      profile: user,
    });
  } catch (err) {
    logError("Failed to update profile", err);
    return sendError(res, HTTP.INTERNAL_SERVER_ERROR, "Failed to update profile");
  }
};


const getPublicProfile = async (req, res) => {
  try {
    const { userID } = req.params;

    // Fetch user, exclude sensitive fields
    const user = await User.findById(userID)
        .select("_id username displayName bio avatar interestedGenres createdAt updatedAt");
    if (!user) {
      return sendError(res, HTTP.NOT_FOUND, "User not found");
    }

    // Fetch up to 5 most recent public collections
    const collections = await Collection.find({ user: userID, visibility: "public" })
        .select("_id title description visibility createdAt updatedAt")
        .sort({ updatedAt: -1 })
        .limit(5);

    // Fetch up to 5 most recent public reading tracker items
    const readingTracker = await ReadingList.find({ user: userID, visibility: "public" })
        .select("_id volumeId status visibility createdAt updatedAt")
        .sort({ updatedAt: -1 })
        .limit(5);

    // Fetch up to 5 most recent public blogs
    const blogs = await Blog.find({ user: userID, visibility: "public" })
        .select("_id title genres visibility spoilerAlert createdAt updatedAt")
        .sort({ updatedAt: -1 })
        .limit(5);

    return sendSuccess(res, HTTP.OK, "User profile data fetched successfully", {
      profile_data: user,
      collections,
      reading_tracker: readingTracker,
      blogs,
    });
  } catch (err) {
    logError("Failed to fetch public profile data", err);
    return sendError(res, HTTP.INTERNAL_SERVER_ERROR, "Failed to fetch public profile data");
  }
};


export const ProfileController = {
  getCurrentProfile,
  updateCurrentProfile,
  getPublicProfile,
};
