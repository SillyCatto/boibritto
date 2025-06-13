const express = require("express");
const {
  ReadingListController,
} = require("../controllers/readingList.controller");

const readingListRoute = express.Router();

readingListRoute.get("/me", ReadingListController.getCurrentUserReadingList);

readingListRoute.get("/:userID", ReadingListController.getReadingListByID);

readingListRoute.post("/", ReadingListController.addToReadingList);

readingListRoute.patch("/:id", ReadingListController.updateReadingListItem);

readingListRoute.delete("/:id", ReadingListController.deleteReadingListItem);

module.exports = readingListRoute;
