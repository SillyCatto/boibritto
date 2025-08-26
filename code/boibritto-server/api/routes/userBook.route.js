import express from 'express';

import { UserBookController } from '../controllers/userBook.controller.js';

const userBookRoute = express.Router();

userBookRoute.get("/", UserBookController.getUserBooksList);

userBookRoute.get("/:id", UserBookController.getOneUserBookByID);

userBookRoute.post("/", UserBookController.createUserBook);

userBookRoute.patch("/:id", UserBookController.updateUserBook);

userBookRoute.delete("/:id", UserBookController.deleteUserBook);

userBookRoute.post("/:id/like", UserBookController.likeUserBook);

export default userBookRoute;
