import express from "express";
import cors from "cors";

import attachUser from "./middlewares/attachUser.js";
import verifyUser from "./middlewares/verifyUser.js";

import {
  jsonErrorHandler,
  routeNotFoundHandler,
  globalErrorHandler,
} from "./middlewares/errorHandler.js";

const app = express();

// global middleware
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL,
      "http://localhost:3000",
      "http://localhost:8000",
    ],
    credentials: true,
  })
);
app.use(express.json());

app.use(jsonErrorHandler);


// import routers
import authRouter from "./routes/auth.route.js";
import collectionRouter from "./routes/collection.route.js";
import blogRouter from "./routes/blog.route.js";
import readingListRouter from "./routes/readingList.route.js";
import profileRouter from "./routes/profile.route.js";
import discussionRouter from "./routes/discussion.route.js";
import commentRouter from "./routes/comment.route.js";
import reportRouter from "./routes/report.route.js";
import userBookRouter from "./routes/userBook.route.js";
import chapterRouter from "./routes/chapter.route.js";

// use routes
app.use("/api/auth", attachUser, authRouter);
app.use("/api/profile", verifyUser, profileRouter);
app.use("/api/collections", verifyUser, collectionRouter);
app.use("/api/blogs", verifyUser, blogRouter);
app.use("/api/reading-list", verifyUser, readingListRouter);
app.use("/api/discussions", verifyUser, discussionRouter);
app.use("/api/comments", verifyUser, commentRouter);
app.use("/api/reports", verifyUser, reportRouter);
app.use("/api/user-books", verifyUser, userBookRouter);
app.use("/api/chapters", verifyUser, chapterRouter);

app.use(routeNotFoundHandler);
app.use(globalErrorHandler);

export default app;
