const express = require("express");
const cors = require("cors");

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

// import routers
const testRouter = require("./routes/testRouter");
const authRouter = require("./routes/authRouter");

// use routes
app.use("/api/test", testRouter);
app.use("/api/auth", authRouter);

module.exports = app;
