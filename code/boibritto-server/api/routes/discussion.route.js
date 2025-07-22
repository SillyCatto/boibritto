import express from "express";
import { DiscussionController, }  from "../controllers/discussion.controller.js";
import  verifyUser  from "../middlewares/verifyUser.js";

const discussionRoute = express.Router();

discussionRoute.get("/", verifyUser, DiscussionController.getDiscussions);
discussionRoute.get("/:id", verifyUser, DiscussionController.getDiscussionById);
discussionRoute.post("/", verifyUser, DiscussionController.createDiscussion);
discussionRoute.patch("/:id", verifyUser, DiscussionController.updateDiscussion);
discussionRoute.delete("/:id", verifyUser, DiscussionController.deleteDiscussion);



export default discussionRoute;