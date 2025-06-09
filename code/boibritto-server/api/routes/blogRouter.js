const express = require("express");
const Blog = require("../models/blog.models");
const mongoose = require("mongoose");
const { sendSuccess, sendError } = require("../utils/response");
const HTTP = require("../utils/httpStatus");

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




module.exports = blogRouter;