import express from "express";
import { CommentController } from "../controllers/comment.controller.js";
import verifyUser from "../middlewares/verifyUser.js";

const commentRoute = express.Router();

commentRoute.get("/:discussionId", verifyUser, CommentController.getCommentsByDiscussion);

export default commentRoute;
