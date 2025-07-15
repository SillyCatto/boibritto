import express from 'express';

import {  BlogController  } from '../controllers/blog.controller.js';

const blogRoute = express.Router();

blogRoute.get("/", BlogController.getBlogsList);

blogRoute.get("/:id", BlogController.getOneBlogByID);

blogRoute.post("/", BlogController.createBlog);

blogRoute.patch("/:id", BlogController.updateBlog);

blogRoute.delete("/:id", BlogController.deleteBlog);

export default blogRoute;
