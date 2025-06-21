const express = require("express");
const cors = require("cors");

const attachUser = require("./middlewares/attachUser");
const verifyUser = require("./middlewares/verifyUser");
const verifyAdmin = require("./middlewares/verifyAdmin");

const {
  jsonErrorHandler,
  routeNotFoundHandler,
  globalErrorHandler,
} = require("./middlewares/errorHandler");

const app = express();

// global middleware
app.use(
  cors({
    origin: [
      //process.env.FRONTEND_URL,
      "http://localhost:3000",
      "http://localhost:8000",
    ],
    credentials: true,
  })
);
app.use(express.json());

app.use(jsonErrorHandler);

// import routers
const adminRouter = require("./routes/admin.route");

const testRouter = require("./routes/test.route");

const authRouter = require("./routes/auth.route");
const collectionRouter = require("./routes/collection.route");
const blogRouter = require("./routes/blog.route");
const readingListRouter = require("./routes/readingList.route");
const profileRouter = require("./routes/profile.route");

// use routes
app.use("/api/test", testRouter);
app.use("/api/auth", attachUser, authRouter);
app.use("/api/collections", verifyUser, collectionRouter);
app.use("/api/blogs", verifyUser, blogRouter);
app.use("/api/reading-list", verifyUser, readingListRouter);
app.use("/api/profile", verifyUser, profileRouter);

app.use("/api/boibritto-internals/admin", verifyAdmin, adminRouter);

app.use(routeNotFoundHandler);
app.use(globalErrorHandler);

module.exports = app;
