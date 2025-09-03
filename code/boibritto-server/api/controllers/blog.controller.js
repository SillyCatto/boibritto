import Blog from "../models/blog.models.js";
import mongoose from "mongoose";
import { logError } from "../utils/logger.js";
import { sendSuccess, sendError } from "../utils/response.js";
import HTTP from "../utils/httpStatus.js";
import { GENRES } from "../utils/constants.js";

const getBlogsList = async (req, res) => {
  try {
    const { author, page = 1, search } = req.query;
    const PAGE_SIZE = 20;
    let filter = {};

    if (!author) {
      // All public blogs
      filter.visibility = "public";
    } else if (author === "me") {
      // All blogs of the authenticated user (private + friends + public)
      filter.user = req.user._id;
    } else {
      // Public blogs of the specified user
      filter.user = author;
      filter.visibility = "public";
    }

    // Search by title
    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }

    let query = Blog.find(filter).populate(
      "user",
      "displayName username avatar uid"
    );

    // Always apply pagination
    query = query.skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE);

    const blogs = await query.sort({ createdAt: -1 });

    return sendSuccess(res, HTTP.OK, "Blogs fetched successfully", { blogs });
  } catch (err) {
    logError("Failed to fetch blogs", err);
    return sendError(res, HTTP.INTERNAL_SERVER_ERROR, "Failed to fetch blogs");
  }
};

const getOneBlogByID = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, HTTP.BAD_REQUEST, "Invalid blog ID");
    }

    const blog = await Blog.findById(id).populate(
      "user",
      "displayName username avatar uid"
    );
    if (!blog) {
      return sendError(res, HTTP.NOT_FOUND, "Blog not found");
    }

    const isOwner = blog.user._id?.toString() === userId?.toString();
    if (blog.visibility !== "public" && !isOwner) {
      return sendError(
        res,
        HTTP.FORBIDDEN,
        "You do not have access to this blog"
      );
    }

    return sendSuccess(res, HTTP.OK, "Blog fetched successfully", { blog });
  } catch (err) {
    logError("Failed to fetch blog", err);
    return sendError(res, HTTP.INTERNAL_SERVER_ERROR, "Failed to fetch blog");
  }
};

const createBlog = async (req, res) => {
  try {
    const { data } = req.body;
    if (!data) {
      return sendError(res, HTTP.BAD_REQUEST, "Missing blog data");
    }

    const {
      title,
      content,
      visibility = "public",
      spoilerAlert,
      genres = [],
    } = data;

    if (!title || !content || typeof spoilerAlert !== "boolean") {
      return sendError(res, HTTP.BAD_REQUEST, "Missing required fields");
    }

    // visibility and genres should be selected from predefined options in the frontend

    const newBlog = new Blog({
      user: req.user._id,
      title,
      content,
      visibility,
      spoilerAlert,
      genres,
    });

    await newBlog.save();
    await newBlog.populate("user", "displayName username avatar uid");

    return sendSuccess(res, HTTP.CREATED, "Blog created successfully", {
      blog: newBlog,
    });
  } catch (err) {
    logError("Failed to create blog", err);
    return sendError(res, HTTP.INTERNAL_SERVER_ERROR, "Failed to create blog");
  }
};

const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { data } = req.body;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, HTTP.BAD_REQUEST, "Invalid blog ID");
    }

    if (!data) {
      return sendError(res, HTTP.BAD_REQUEST, "Missing data to update");
    }

    const blog = await Blog.findById(id);
    if (!blog) {
      return sendError(res, HTTP.NOT_FOUND, "Blog not found");
    }

    if (blog.user.toString() !== userId.toString()) {
      return sendError(
        res,
        HTTP.FORBIDDEN,
        "You do not have permission to update this blog"
      );
    }

    // Update given fields
    if (data.title !== undefined) blog.title = data.title;
    if (data.content !== undefined) blog.content = data.content;
    if (data.visibility !== undefined) blog.visibility = data.visibility;
    if (data.spoilerAlert !== undefined) blog.spoilerAlert = data.spoilerAlert;
    if (data.genres !== undefined) blog.genres = data.genres;

    await blog.save();
    await blog.populate("user", "displayName username avatar uid");

    return sendSuccess(res, HTTP.OK, "Blog updated successfully", { blog });
  } catch (err) {
    logError("Failed to update blog", err);
    return sendError(res, HTTP.INTERNAL_SERVER_ERROR, "Failed to update blog");
  }
};

const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, HTTP.BAD_REQUEST, "Invalid blog ID");
    }

    const blog = await Blog.findById(id);
    if (!blog) {
      return sendError(res, HTTP.NOT_FOUND, "Blog not found");
    }

    if (blog.user.toString() !== userId.toString()) {
      return sendError(
        res,
        HTTP.FORBIDDEN,
        "You do not have permission to delete this blog"
      );
    }

    await blog.deleteOne();

    return sendSuccess(res, HTTP.OK, "Blog deleted successfully");
  } catch (err) {
    logError("Failed to delete blog", err);
    return sendError(res, HTTP.INTERNAL_SERVER_ERROR, "Failed to delete blog");
  }
};

export const BlogController = {
  getBlogsList,
  getOneBlogByID,
  createBlog,
  updateBlog,
  deleteBlog,
};
