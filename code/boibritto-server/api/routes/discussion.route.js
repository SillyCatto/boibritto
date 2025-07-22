import express from "express";
import { DiscussionController, }  from "../controllers/discussion.controller.js";
import  verifyUser  from "../middlewares/verifyUser.js";

const discussionRoute = express.Router();

discussionRoute.get("/", verifyUser, DiscussionController.getDiscussions);
discussionRoute.get("/:id", verifyUser, DiscussionController.getDiscussionById);

export default discussionRoute;