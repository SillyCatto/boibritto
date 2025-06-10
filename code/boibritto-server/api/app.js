const express = require("express");
const cors = require("cors");

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
      process.env.FRONTEND_URL,
      "http://localhost:5173",
      "http://localhost:8000",
    ],
    credentials: true,
  }),
);
app.use(express.json());

app.use(jsonErrorHandler);

// import routers
const testRouter = require("./routes/testRouter");
const authRouter = require("./routes/authRouter");
const collectionRouter = require("./routes/collectionRouter");
const adminRouter = require("./routes/adminRouter");
const blogRouter = require("./routes/blogRouter");

// use routes
app.use("/api/test", testRouter);
app.use("/api/auth", authRouter);
app.use("/api/collections", verifyUser, collectionRouter);
app.use("/api/blogs", verifyUser, blogRouter);

app.use("/api/boibritto-internals/admin", verifyAdmin, adminRouter);

app.use(routeNotFoundHandler);
app.use(globalErrorHandler);

module.exports = app;
