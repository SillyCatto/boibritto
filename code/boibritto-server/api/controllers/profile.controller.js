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

export const ProfileController = {
  getCurrentProfile,
};
