
const mongoose = require("mongoose");
const ReadingList = require("../models/readingList.models");
const { sendSuccess, sendError } = require("../utils/response");
const HTTP = require("../utils/httpStatus");
const { logError } = require("../utils/logger");
const { checkOwner } = require("../utils/checkOwner");

const getReadingList = async (req, res) => {
  try {
    const userId = req.user._id;
    const readingList = await ReadingList.find({ user: userId });
    return sendSuccess(res, HTTP.OK, "Reading list fetched successfully", { readingList });
  } catch (err) {
    logError("Failed to fetch reading list", err);
    return sendError(res, HTTP.INTERNAL_SERVER_ERROR, "Failed to fetch reading list");
  }
};


const getReadingListByID = async (req, res) => {
  try {
    const { userID } = req.params;
    const readingList = await ReadingList.find({
      user: userID,
      visibility: "public",
    });
    return sendSuccess(res, HTTP.OK, "Reading list fetched successfully", { readingList });
  } catch (err) {
    logError("Failed to fetch public reading list", err);
    return sendError(res, HTTP.INTERNAL_SERVER_ERROR, "Failed to fetch reading list");
  }
};


const addToReadingList = async (req, res) => {
  try {
    const userId = req.user._id;
    const data = req.body.data || {};

    const { volumeId, status, startedAt, completedAt, visibility = "public" } = data;

    if (!volumeId || !status) {
      return sendError(res, HTTP.BAD_REQUEST, "volumeId and status are required");
    }

    // Validation for startedAt and completedAt
    if ((status === "reading" || status === "completed") && !startedAt) {
      return sendError(res, HTTP.BAD_REQUEST, "startedAt is required for status 'reading' or 'completed'");
    }
    if (status === "completed" && !completedAt) {
      return sendError(res, HTTP.BAD_REQUEST, "completedAt is required for status 'completed'");
    }

    const newItem = new ReadingList({
      user: userId,
      volumeId,
      status,
      startedAt,
      completedAt,
      visibility,
    });

    await newItem.save();

    // Return full updated reading list
    const readingList = await ReadingList.find({ user: userId });

    return sendSuccess(res, HTTP.OK, "Reading list updated successfully", { readingList });
  } catch (err) {
    logError("Failed to add to reading list", err);
    return sendError(res, HTTP.INTERNAL_SERVER_ERROR, "Failed to add to reading list");
  }
};


const updateReadingListItem = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const data = req.body.data || {};

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, HTTP.BAD_REQUEST, "Invalid reading list item ID");
    }

    const item = await ReadingList.findById(id);
    if (!item) {
      return sendError(res, HTTP.NOT_FOUND, "Reading list item not found");
    }

    if (!checkOwner(item.user, userId)) {
      return sendError(res, HTTP.FORBIDDEN, "You do not have permission to update this item");
    }

    // Apply updates
    if (data.status !== undefined) item.status = data.status;
    if (data.startedAt !== undefined) item.startedAt = data.startedAt;
    if (data.completedAt !== undefined) item.completedAt = data.completedAt;
    if (data.visibility !== undefined) item.visibility = data.visibility;

    // Validation for startedAt and completedAt
    if ((item.status === "reading" || item.status === "completed") && !item.startedAt) {
      return sendError(res, HTTP.BAD_REQUEST, "startedAt is required for status 'reading' or 'completed'");
    }
    if (item.status === "completed" && !item.completedAt) {
      return sendError(res, HTTP.BAD_REQUEST, "completedAt is required for status 'completed'");
    }

    await item.save();

    // Return full updated reading list
    const readingList = await ReadingList.find({ user: userId });

    return sendSuccess(res, HTTP.OK, "Reading list updated successfully", { readingList });
  } catch (err) {
    logError("Failed to update reading list item", err);
    return sendError(res, HTTP.INTERNAL_SERVER_ERROR, "Failed to update reading list item");
  }
};


module.exports = {
  getReadingList,
  getReadingListByID,
  addToReadingList,
  updateReadingListItem,
};