const ReadingList = require("../models/readingList.models");
const { sendSuccess, sendError } = require("../utils/response");
const HTTP = require("../utils/httpStatus");
const { logError } = require("../utils/logger");

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

module.exports = {
  getReadingList,
  getReadingListByID,
  addToReadingList,
};