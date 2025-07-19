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

// Serve static files for AdminJS
app.use(express.static('public'));

// import routers
import authRouter from "./routes/auth.route.js";
import collectionRouter from "./routes/collection.route.js";
import blogRouter from "./routes/blog.route.js";
import readingListRouter from "./routes/readingList.route.js";
import profileRouter from "./routes/profile.route.js";

// use routes
app.use("/api/auth", attachUser, authRouter);
app.use("/api/profile", verifyUser, profileRouter);
app.use("/api/collections", verifyUser, collectionRouter);
app.use("/api/blogs", verifyUser, blogRouter);
app.use("/api/reading-list", verifyUser, readingListRouter);

app.use(routeNotFoundHandler);
app.use(globalErrorHandler);

export default app;
