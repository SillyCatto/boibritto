import express from 'express';
import { 
  ReadingListController,
 } from '../controllers/readingList.controller.js';

const readingListRoute = express.Router();

readingListRoute.get("/me", ReadingListController.getCurrentUserReadingList);

readingListRoute.get("/recommendations", ReadingListController.getRecommendations);

readingListRoute.get("/:userID", ReadingListController.getReadingListByID);

readingListRoute.post("/", ReadingListController.addToReadingList);

readingListRoute.patch("/:id", ReadingListController.updateReadingListItem);

readingListRoute.delete("/:id", ReadingListController.deleteReadingListItem);

export default readingListRoute;
