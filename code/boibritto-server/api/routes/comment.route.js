import express from "express";
import { CommentController } from "../controllers/comment.controller.js";
import verifyUser from "../middlewares/verifyUser.js";

const commentRoute = express.Router();

commentRoute.get("/:discussionId", verifyUser, CommentController.getCommentsByDiscussion);
commentRoute.post("/", verifyUser, CommentController.createComment);
commentRoute.patch("/:id", verifyUser, CommentController.updateComment);
commentRoute.delete("/:id", verifyUser, CommentController.deleteComment);

export default commentRoute;
