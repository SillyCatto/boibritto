const User = require("../models/user.models");
const Collection = require("../models/collection.models");
const ReadingList = require("../models/readingList.models");
const Blog = require("../models/blog.models");
const HTTP = require("../utils/httpStatus");
const { sendSuccess, sendError } = require("../utils/response");
const { logError } = require("../utils/logger");

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

module.exports.ProfileController = {
  getCurrentProfile,
};
