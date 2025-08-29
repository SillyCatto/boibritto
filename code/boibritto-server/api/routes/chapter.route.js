import express from 'express';

import { ChapterController } from '../controllers/chapter.controller.js';

const chapterRoute = express.Router();

chapterRoute.get("/book/:bookId", ChapterController.getChaptersForBook);

chapterRoute.get("/:id", ChapterController.getChapterById);

chapterRoute.post("/", ChapterController.createChapter);

chapterRoute.patch("/:id", ChapterController.updateChapter);

chapterRoute.delete("/:id", ChapterController.deleteChapter);

chapterRoute.post("/:id/like", ChapterController.likeChapter);

export default chapterRoute;
