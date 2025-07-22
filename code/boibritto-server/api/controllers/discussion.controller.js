import  Discussion  from "../models/discussion.models.js";
import User from "../models/user.models.js";
import { sendSuccess, sendError } from "../utils/response.js";
import HTTP from "../utils/httpStatus.js";
import { logError } from "../utils/logger.js";
import { GENRES } from "../utils/constants.js";

const getDiscussions = async (req, res) => {
  try {
    const { author, search } = req.query;
    const currentUserId = req.user._id;
    let filter = {};

    // Handle author parameter
    if (author === "me") {
      filter.user = currentUserId;
      // For now, only return public discussions even for current user ***
      filter.visibility = "public";
    } else if (author) {
      // Specific user - only public discussions
      const targetUser = await User.findById(author);
      if (!targetUser) {
        return sendError(res, HTTP.NOT_FOUND, "User not found");
      }
      filter.user = author;
      filter.visibility = "public";
    } else {
      // No author specified - all public discussions
      filter.visibility = "public";
    }

    // Handle search parameter
    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }

    const discussions = await Discussion.find(filter)
      .populate("user", "_id username displayName avatar")
      .select("_id user title visibility spoilerAlert genres createdAt updatedAt __v")
      .sort({ updatedAt: -1 })
      .limit(20);

    return sendSuccess(res, HTTP.OK, "Discussions fetched successfully", {
      discussions,
    });
  } catch (err) {
    logError("Failed to fetch discussions", err);
    return sendError(res, HTTP.INTERNAL_SERVER_ERROR, "Failed to fetch discussions");
  }
};


const getDiscussionById = async (req, res) => {
  try {
    const { id } = req.params;

    const discussion = await Discussion.findById(id)
      .populate("user", "_id username displayName avatar");

    if (!discussion) {
      return sendError(res, HTTP.NOT_FOUND, "Discussion not found or not accessible");
    }

    // Only public discussions !!!
    if (discussion.visibility !== "public") {
      return sendError(res, HTTP.NOT_FOUND, "Discussion not found or not accessible");
    }

    return sendSuccess(res, HTTP.OK, "Discussion fetched successfully", {
      discussion,
    });
  } catch (err) {
    logError("Failed to fetch discussion", err);
    return sendError(res, HTTP.INTERNAL_SERVER_ERROR, "Failed to fetch discussion");
  }
};

const createDiscussion = async (req, res) => {
  try {
    const { title, content, spoilerAlert, genres } = req.body.data || {};

    // Validation
    if (!title || typeof title !== "string" || title.length > 100) {
      return sendError(res, HTTP.BAD_REQUEST, "Title is required and must be <= 100 characters.");
    }
    if (!content || typeof content !== "string" || content.length > 2000) {
      return sendError(res, HTTP.BAD_REQUEST, "Content is required and must be <= 2000 characters.");
    }
    if (typeof spoilerAlert !== "boolean") {
      return sendError(res, HTTP.BAD_REQUEST, "spoilerAlert is required and must be boolean.");
    }
    let validGenres = [];
    if (Array.isArray(genres)) {
      validGenres = genres.filter(g => GENRES.includes(g));
    }

    // Only public discussions for now
    const discussion = await Discussion.create({
      user: req.user._id,
      title,
      content,
      visibility: "public",
      spoilerAlert,
      genres: validGenres
    });

    await discussion.populate("user", "_id username displayName avatar");

    return sendSuccess(res, HTTP.CREATED, "Discussion created successfully", {
      discussion,
    });
  } catch (err) {
    logError("Failed to create discussion", err);
    return sendError(res, HTTP.INTERNAL_SERVER_ERROR, "Failed to create discussion");
  }
};


const updateDiscussion = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body.data || {};

    const discussion = await Discussion.findById(id);
    if (!discussion || discussion.visibility !== "public") {
      return sendError(res, HTTP.NOT_FOUND, "Discussion not found or not accessible");
    }

    // Only owner can update
    if (discussion.user.toString() !== req.user._id.toString()) {
      return sendError(res, HTTP.FORBIDDEN, "You do not have permission to update this discussion");
    }

    // Validate and apply updates
    if (updates.title !== undefined) {
      if (typeof updates.title !== "string" || updates.title.length > 100) {
        return sendError(res, HTTP.BAD_REQUEST, "Title must be a string <= 100 characters.");
      }
      discussion.title = updates.title;
    }
    if (updates.content !== undefined) {
      if (typeof updates.content !== "string" || updates.content.length > 2000) {
        return sendError(res, HTTP.BAD_REQUEST, "Content must be a string <= 2000 characters.");
      }
      discussion.content = updates.content;
    }
    if (updates.spoilerAlert !== undefined) {
      if (typeof updates.spoilerAlert !== "boolean") {
        return sendError(res, HTTP.BAD_REQUEST, "spoilerAlert must be boolean.");
      }
      discussion.spoilerAlert = updates.spoilerAlert;
    }
    if (updates.genres !== undefined) {
      if (!Array.isArray(updates.genres)) {
        return sendError(res, HTTP.BAD_REQUEST, "Genres must be an array.");
      }
      discussion.genres = updates.genres.filter(g => GENRES.includes(g));
    }

    await discussion.save();
    await discussion.populate("user", "_id username displayName avatar");

    return sendSuccess(res, HTTP.OK, "Discussion updated successfully", {
      discussion,
    });
  } catch (err) {
    logError("Failed to update discussion", err);
    return sendError(res, HTTP.INTERNAL_SERVER_ERROR, "Failed to update discussion");
  }
};

export const DiscussionController = {
  getDiscussions,
  getDiscussionById,
  createDiscussion,
  updateDiscussion,
};