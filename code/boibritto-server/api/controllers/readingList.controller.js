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

module.exports = { getReadingList };