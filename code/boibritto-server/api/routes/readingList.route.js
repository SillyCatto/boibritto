const express = require("express");
const { ReadingListController } = require("../controllers/readingList.controller");

const readingListRoute = express.Router();

readingListRoute.get("/me", ReadingListController.getReadingList);

module.exports = readingListRoute;