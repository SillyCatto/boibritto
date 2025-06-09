const express = require("express");
const Blog = require("../models/blog.models");
const mongoose = require("mongoose");
const { sendSuccess, sendError } = require("../utils/response");
const HTTP = require("../utils/httpStatus");
const { GENRES } = require("../utils/constants");


const blogRouter = express.Router();

blogRouter.get("/", async (req, res) => {
  try {
    const { author, page = 1 } = req.query;
    const PAGE_SIZE = 20;
    let filter = {};
    let isPaginated = false;

    if (!author) {
      // All public blogs, paginated
      filter.visibility = "public";
      isPaginated = true;
    } else if (author === "me") {
      // All blogs of the authenticated user (private + friends + public)
      filter.user = req.user._id;
    } else {
      // Public blogs of the specified user
      filter.user = author;
      filter.visibility = "public";
    }

    let query = Blog.find(filter).populate("user", "displayName username avatar");

    if (isPaginated) {
      query = query.skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE);
    }

    const blogs = await query.sort({ createdAt: -1 });

    return sendSuccess(res, HTTP.OK, "Blogs fetched successfully", { blogs });
  } catch (err) {
    return sendError(res, HTTP.INTERNAL_SERVER_ERROR, "Failed to fetch blogs", err);
  }
});


blogRouter.post("/", async (req, res) => {
  try {
    const { data } = req.body;
    if (!data) {
      return sendError(res, HTTP.BAD_REQUEST, "Missing blog data");
    }

    const { title, content, visibility = "public", spoilerAlert, genres = [] } = data;

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
    await newBlog.populate("user", "displayName username avatar");

    return sendSuccess(res, HTTP.CREATED, "Blog created successfully", { blog: newBlog });
  } catch (err) {
    return sendError(res, HTTP.INTERNAL_SERVER_ERROR, "Failed to create blog", err);
  }
});


blogRouter.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, HTTP.BAD_REQUEST, "Invalid blog ID");
    }

    const blog = await Blog.findById(id).populate("user", "displayName username avatar");
    if (!blog) {
      return sendError(res, HTTP.NOT_FOUND, "Blog not found");
    }

    const isOwner = blog.user._id?.toString() === userId?.toString();
    if (blog.visibility !== "public" && !isOwner) {
      return sendError(res, HTTP.FORBIDDEN, "You do not have access to this blog");
    }

    return sendSuccess(res, HTTP.OK, "Blog fetched successfully", { blog });
  } catch (err) {
    return sendError(res, HTTP.INTERNAL_SERVER_ERROR, "Failed to fetch blog", err);
  }
});

module.exports = blogRouter;