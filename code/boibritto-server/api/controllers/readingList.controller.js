const mongoose = require("mongoose");
const ReadingList = require("../models/readingList.models");
const { sendSuccess, sendError } = require("../utils/response");
const HTTP = require("../utils/httpStatus");
const { logError } = require("../utils/logger");
const { checkOwner } = require("../utils/checkOwner");
const {
  validateReadingListDates,
} = require("../utils/validateReadingListDates");

const getCurrentUserReadingList = async (req, res) => {
  try {
    const userId = req.user._id;
    const readingList = await ReadingList.find({ user: userId });
    return sendSuccess(
      res,
      HTTP.OK,
      "Reading list for current user fetched successfully",
      {
        readingList,
      },
    );
  } catch (err) {
    logError("Failed to fetch reading list", err);
    return sendError(
      res,
      HTTP.INTERNAL_SERVER_ERROR,
      "Failed to fetch reading list",
    );
  }
};

const getReadingListByID = async (req, res) => {
  try {
    const { userID } = req.params;
    const readingList = await ReadingList.find({
      user: userID,
      visibility: "public",
    });
    return sendSuccess(res, HTTP.OK, "Reading list fetched successfully", {
      readingList,
    });
  } catch (err) {
    logError("Failed to fetch public reading list", err);
    return sendError(
      res,
      HTTP.INTERNAL_SERVER_ERROR,
      "Failed to fetch reading list",
    );
  }
};

const addToReadingList = async (req, res) => {
  try {
    const userId = req.user._id;
    const data = req.body.data || {};

    const {
      volumeId,
      status,
      startedAt,
      completedAt,
      visibility = "public",
    } = data;

    if (!volumeId || !status) {
      return sendError(
        res,
        HTTP.BAD_REQUEST,
        "volumeId and status are required",
      );
    }

    // prevent duplicate entry
    const existing = await ReadingList.findOne({ user: userId, volumeId });
    if (existing) {
      return sendError(
        res,
        HTTP.CONFLICT,
        "This book already exists in your reading list",
      );
    }

    const dateValidationError = validateReadingListDates(data);
    if (dateValidationError) {
      return sendError(res, HTTP.BAD_REQUEST, dateValidationError);
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

    // return updated list
    const updatedList = await ReadingList.find({ user: userId });

    return sendSuccess(
      res,
      HTTP.OK,
      "Book added to reading list updated successfully",
      {
        readingList: updatedList,
      },
    );
  } catch (err) {
    logError("Failed to add to reading list", err);
    return sendError(
      res,
      HTTP.INTERNAL_SERVER_ERROR,
      "Failed to add to reading list",
    );
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
      return sendError(
        res,
        HTTP.FORBIDDEN,
        "You do not have permission to update this item",
      );
    }

    // Apply updates
    if (data.status !== undefined) item.status = data.status;
    if (data.startedAt !== undefined) item.startedAt = data.startedAt;
    if (data.completedAt !== undefined) item.completedAt = data.completedAt;
    if (data.visibility !== undefined) item.visibility = data.visibility;

    const dateValidationError = validateReadingListDates(data);
    if (dateValidationError) {
      return sendError(res, HTTP.BAD_REQUEST, dateValidationError);
    }

    await item.save();

    const updatedList = await ReadingList.find({ user: userId });

    return sendSuccess(res, HTTP.OK, "Reading list updated successfully", {
      readingList: updatedList,
    });
  } catch (err) {
    logError("Failed to update reading list item", err);
    return sendError(
      res,
      HTTP.INTERNAL_SERVER_ERROR,
      "Failed to update reading list item",
    );
  }
};

const deleteReadingListItem = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, HTTP.BAD_REQUEST, "Invalid reading list item ID");
    }

    const item = await ReadingList.findById(id);
    if (!item) {
      return sendError(res, HTTP.NOT_FOUND, "Reading list item not found");
    }

    if (!checkOwner(item.user, userId)) {
      return sendError(
        res,
        HTTP.FORBIDDEN,
        "You do not have permission to delete this item",
      );
    }

    await item.deleteOne();

    const updatedList = await ReadingList.find({ user: userId });

    return sendSuccess(res, HTTP.OK, "Reading list item deleted successfully", {
      readingList: updatedList,
    });
  } catch (err) {
    logError("Failed to delete reading list item", err);
    return sendError(
      res,
      HTTP.INTERNAL_SERVER_ERROR,
      "Failed to delete reading list item",
    );
  }
};

module.exports.ReadingListController = {
  getCurrentUserReadingList,
  getReadingListByID,
  addToReadingList,
  updateReadingListItem,
  deleteReadingListItem,
};
