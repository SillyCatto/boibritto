import express from 'express';

import { UserBookController } from '../controllers/userBook.controller.js';
import { ChapterController } from '../controllers/chapter.controller.js';

const userBookRoute = express.Router();

userBookRoute.get("/", UserBookController.getUserBooksList);

userBookRoute.get("/:id", UserBookController.getOneUserBookByID);

// Add chapters route for a specific book
userBookRoute.get("/:id/chapters", ChapterController.getChaptersForBook);

userBookRoute.post("/", UserBookController.createUserBook);

userBookRoute.patch("/:id", UserBookController.updateUserBook);

userBookRoute.delete("/:id", UserBookController.deleteUserBook);

userBookRoute.post("/:id/like", UserBookController.likeUserBook);

export default userBookRoute;
