import Collection from '../models/collection.models.js';
import mongoose from 'mongoose';
import { sendSuccess, sendError } from '../utils/response.js';
import HTTP from '../utils/httpStatus.js';
import { logError } from '../utils/logger.js';

const getCollectionsList = async (req, res) => {
  try {
    const { owner, page = 1, search, tag } = req.query;
    const PAGE_SIZE = 20;
    let filter = {};

    if (!owner) {
      // All public collections
      filter.visibility = "public";
    } else if (owner === "me") {
      // All collections of the authenticated user (private + public)
      filter.user = req.user._id;
    } else {
      // Public collections of the specified user
      filter.user = owner;
      filter.visibility = "public";
    }

    // search by title
    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }

    // Search by tag
    if (tag) {
      filter.tags = tag;
    }

    let query = Collection.find(filter).populate(
      "user",
      "displayName username avatar",
    );

    // Always apply pagination
    query = query.skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE);

    const collections = await query.sort({ createdAt: -1 });

    return sendSuccess(res, HTTP.OK, "Collections fetched successfully", {
      collections,
    });
  } catch (err) {
    logError("Failed to fetch collections", err);
    return sendError(
      res,
      HTTP.INTERNAL_SERVER_ERROR,
      "Failed to fetch collections",
    );
  }
};

const getOneCollectionByID = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, HTTP.BAD_REQUEST, "invalid collection ID");
    }

    const collection = await Collection.findById(id).populate(
      "user",
      "displayName username avatar",
    );
    if (!collection) {
      return sendError(res, HTTP.NOT_FOUND, "Collection not found");
    }

    const isOwner = collection.user._id?.toString() === userId?.toString();

    if (collection.visibility !== "public" && !isOwner) {
      return sendError(
        res,
        HTTP.FORBIDDEN,
        "You do not have access to this collection",
      );
    }

    return sendSuccess(res, HTTP.OK, "Collection fetched successfully", {
      collection,
    });
  } catch (err) {
    logError("Failed to fetch collection", err);
    return sendError(
      res,
      HTTP.INTERNAL_SERVER_ERROR,
      "Failed to fetch collection",
    );
  }
};

const createCollection = async (req, res) => {
  try {
    const { data } = req.body;

    if (!data) {
      return sendError(res, HTTP.BAD_REQUEST, "missing data to update");
    }

    if (!data.title) {
      return sendError(res, HTTP.BAD_REQUEST, "collection title is required");
    }

    const newCollection = new Collection({
      user: req.user._id,
      title: data.title,
      description: data.description || "",
      books: Array.isArray(data.books) ? data.books : [],
      tags: Array.isArray(data.tags) ? data.tags : [],
      visibility: data.visibility || "public",
    });

    await newCollection.save();

    // Populate user fields for response consistency
    await newCollection.populate("user", "displayName username avatar");

    return sendSuccess(res, HTTP.CREATED, "Collection created successfully", {
      collection: newCollection,
    });
  } catch (err) {
    logError("Failed to create collection", err);
    return sendError(
      res,
      HTTP.INTERNAL_SERVER_ERROR,
      "Failed to create collection",
    );
  }
};

const updateCollection = async (req, res) => {
  try {
    const { id } = req.params;
    const { data } = req.body;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, HTTP.BAD_REQUEST, "invalid collection ID");
    }

    if (!data) {
      return sendError(res, HTTP.BAD_REQUEST, "missing data to update");
    }

    const collection = await Collection.findById(id);
    if (!collection) {
      return sendError(res, HTTP.NOT_FOUND, "Collection not found");
    }

    if (collection.user.toString() !== userId.toString()) {
      return sendError(
        res,
        HTTP.FORBIDDEN,
        "You do not have permission to update this collection",
      );
    }

    // Update fields if provided
    if (data.title !== undefined) collection.title = data.title;
    if (data.description !== undefined)
      collection.description = data.description;
    if (data.visibility !== undefined) collection.visibility = data.visibility;

    // Add a book
    if (data.addBook) {
      if (!collection.books.some((b) => b.volumeId === data.addBook)) {
        collection.books.push({ volumeId: data.addBook });
      }
    }

    // Remove a book
    if (data.removeBook) {
      collection.books = collection.books.filter(
        (b) => b.volumeId !== data.removeBook,
      );
    }

    await collection.save();
    await collection.populate("user", "displayName username avatar");

    return sendSuccess(res, HTTP.OK, "Collection updated successfully", {
      collection,
    });
  } catch (err) {
    logError("Failed to update collection", err);
    return sendError(
      res,
      HTTP.INTERNAL_SERVER_ERROR,
      "Failed to update collection",
    );
  }
};

const deleteCollection = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, HTTP.BAD_REQUEST, "invalid collection ID");
    }

    const collection = await Collection.findById(id);
    if (!collection) {
      return sendError(res, HTTP.NOT_FOUND, "Collection not found");
    }

    if (collection.user.toString() !== userId.toString()) {
      return sendError(
        res,
        HTTP.FORBIDDEN,
        "You do not have permission to delete this collection",
      );
    }

    await collection.deleteOne();

    const updatedCollections = await Collection.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate("user", "displayName username avatar");

    return sendSuccess(res, HTTP.OK, "Collection deleted successfully", {
      collections: updatedCollections,
    });
  } catch (err) {
    logError("Failed to delete collection", err);
    return sendError(
      res,
      HTTP.INTERNAL_SERVER_ERROR,
      "Failed to delete collection",
    );
  }
};

export const CollectionController = {
  getCollectionsList,
  getOneCollectionByID,
  createCollection,
  updateCollection,
  deleteCollection,
};
