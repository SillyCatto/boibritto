import mongoose from 'mongoose';
import ReadingList from '../models/readingList.models.js';
import {  sendSuccess, sendError  } from '../utils/response.js';
import HTTP from '../utils/httpStatus.js';
import {  logError  } from '../utils/logger.js';
import {  checkOwner  } from '../utils/checkOwner.js';
import validateReadingListDates from '../utils/validateReadingListDates.js';

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
      genres = [],
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

    // Normalize genres to lowercase for consistency
    const normalizedGenres = genres.map(genre => genre.toLowerCase().trim());

    const newItem = new ReadingList({
      user: userId,
      volumeId,
      status,
      startedAt,
      completedAt,
      visibility,
      genres: normalizedGenres,
    });

    await newItem.save();

    // return updated list
    const updatedList = await ReadingList.find({ user: userId });

    return sendSuccess(
      res,
      HTTP.OK,
      "Book added to reading list successfully",
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

    /**
     * a few user action cases to handle:
     * => directly add a book (POST) with 'completed' status
     *      in this case frontend must provide both start and end date
     *
     * => update  status from 'reading' to 'completed'
     *      in this case fetch start date from previous reading status, before updating, we had the status as reading and also had the start date, so get the start date from there, and frontend has to provide only the end date
     *
     * => update status from 'interested' to 'completed'
     *      here also frontend must provide both start and end date
     *
     *
     * the following code handles this by merging and overriding existing data from db and new data frontend
     * (needs more testing)
     *
     * */
    const mergedData = {
      ...item.toObject(), // existing item values
      ...data, // override with new values
    };

    const dateValidationError = validateReadingListDates(mergedData);
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

const getRecommendations = async (req, res) => {
  try {
    const userId = req.user._id;

    // Aggregate genres from user's reading list
    const genreStats = await ReadingList.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { $unwind: "$genres" },
      { $group: { _id: "$genres", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    const topGenres = genreStats.map(item => ({
      genre: item._id,
      count: item.count
    }));

    return sendSuccess(
      res,
      HTTP.OK,
      "Recommendations fetched successfully",
      {
        topGenres,
      },
    );
  } catch (err) {
    logError("Failed to fetch recommendations", err);
    return sendError(
      res,
      HTTP.INTERNAL_SERVER_ERROR,
      "Failed to fetch recommendations",
    );
  }
};

export const ReadingListController = {
  getCurrentUserReadingList,
  getReadingListByID,
  addToReadingList,
  updateReadingListItem,
  deleteReadingListItem,
  getRecommendations,
};
