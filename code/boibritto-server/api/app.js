const express = require("express");
const cors = require("cors");

const app = express();

// global middleware
app.use(
  cors({
    origin: [process.env.FRONTEND_URL, "http://localhost:5173"],
    credentials: true,
  }),
);

app.use(express.json());

// test route
app.get("/ping", (req, res) => {
  res.send("pong");
});

module.exports = app;
