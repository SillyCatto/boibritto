const express = require("express");
const Collection = require("../models/collection.models");
const verifyFirebaseToken = require("../middlewares/verifyFirebaseToken");
const { sendSuccess, sendError } = require("../utils/response");
const HTTP = require("../utils/httpStatus");

const collectionRouter = express.Router();

collectionRouter.get("/", verifyFirebaseToken, async (req, res) => {
  try {
    const { owner, page = 1 } = req.query;
    const PAGE_SIZE = 20;
    let filter = {};
    let isPaginated = false;

    if (!owner) {
      // All public collections, paginated
      filter.visibility = "public";
      isPaginated = true;
    } else if (owner === "me") {
      // All collections of the authenticated user (private + public)
      filter.user = req.user._id || req.user.uid;
    } else {
      // Public collections of the specified user
      filter.user = owner;
      filter.visibility = "public";
    }

    let query = Collection.find(filter).populate("user", "displayName username avatar");

    if (isPaginated) {
      query = query
        .skip((page - 1) * PAGE_SIZE)
        .limit(PAGE_SIZE);
    }

    const collections = await query.sort({ createdAt: -1 });

    return sendSuccess(res, HTTP.OK, "Collections fetched successfully", {
      collections,
    });
  } catch (err) {
    return sendError(res, HTTP.INTERNAL_SERVER_ERROR, "Failed to fetch collections", err);
  }
});


collectionRouter.post("/", verifyFirebaseToken, async (req, res) => {
    try {
        const { data } = req.body;
        if (!data || !data.title) {
            return sendError(res, HTTP.BAD_REQUEST, "Title is required");
        }

        const newCollection = new Collection({
            user: req.user._id || req.user.uid,
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
        return sendError(res, HTTP.INTERNAL_SERVER_ERROR, "Failed to create collection", err);
    }
});


collectionRouter.get("/:id", verifyFirebaseToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.uid;

    const collection = await Collection.findById(id).populate("user", "displayName username avatar");
    if (!collection) {
      return sendError(res, HTTP.NOT_FOUND, "Collection not found");
    }

    const isOwner = collection.user._id?.toString() === userId?.toString() || collection.user.uid === userId;
    if (collection.visibility !== "public" && !isOwner) {
      return sendError(res, HTTP.FORBIDDEN, "You do not have access to this collection");
    }

    return sendSuccess(res, HTTP.OK, "Collection fetched successfully", {
      collection,
    });
  } catch (err) {
    return sendError(res, HTTP.INTERNAL_SERVER_ERROR, "Failed to fetch collection", err);
  }
});


collectionRouter.patch("/:id", verifyFirebaseToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { data } = req.body;
    const userId = req.user._id || req.user.uid;

    const collection = await Collection.findById(id);
    if (!collection) {
      return sendError(res, HTTP.NOT_FOUND, "Collection not found");
    }

    if (collection.user.toString() !== userId.toString()) {
      return sendError(res, HTTP.FORBIDDEN, "You do not have permission to update this collection");
    }

    // Update fields if provided
    if (data.title !== undefined) collection.title = data.title;
    if (data.description !== undefined) collection.description = data.description;
    if (data.visibility !== undefined) collection.visibility = data.visibility;


    // Add a book
    if (data.addBook) {
      if (!collection.books.some(b => b.volumeId === data.addBook)) {
        collection.books.push({ volumeId: data.addBook });
      }
    }

    // Remove a book
    if (data.removeBook) {
      collection.books = collection.books.filter(b => b.volumeId !== data.removeBook);
    }

    await collection.save();
    await collection.populate("user", "displayName username avatar");

    return sendSuccess(res, HTTP.OK, "Collection updated successfully", {
      collection,
    });
  } catch (err) {
    return sendError(res, HTTP.INTERNAL_SERVER_ERROR, "Failed to update collection", err);
  }
});


collectionRouter.delete("/:id", verifyFirebaseToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.uid;

    const collection = await Collection.findById(id);
    if (!collection) {
      return sendError(res, HTTP.NOT_FOUND, "Collection not found");
    }

    if (collection.user.toString() !== userId.toString()) {
      return sendError(res, HTTP.FORBIDDEN, "You do not have permission to delete this collection");
    }

    await collection.deleteOne();

    return sendSuccess(res, HTTP.OK, "Collection deleted successfully");
  } catch (err) {
    return sendError(res, HTTP.INTERNAL_SERVER_ERROR, "Failed to delete collection", err);
  }
});

module.exports = collectionRouter;