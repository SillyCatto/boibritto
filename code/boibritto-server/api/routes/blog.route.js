const express = require("express");

const { BlogController } = require("../controllers/blog.controller");

const blogRoute = express.Router();

blogRoute.get("/", BlogController.getBlogsList);

blogRoute.get("/:id", BlogController.getOneBlogByID);

blogRoute.post("/", BlogController.createBlog);

blogRoute.patch("/:id", BlogController.updateBlog);

blogRoute.delete("/:id", BlogController.deleteBlog);

module.exports = blogRoute;
