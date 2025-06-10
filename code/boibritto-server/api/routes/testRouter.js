const express = require("express");
const verifyFirebaseToken = require("../middlewares/verifyUser");
const { sendSuccess, sendError } = require("../utils/response");
const HTTP = require("../utils/httpStatus");

const testRouter = express.Router();

// test regular route
testRouter.get("/ping", (req, res) => {
  res.status(HTTP.OK).send("pong");
});

// test protected
testRouter.get("/protected", verifyFirebaseToken, (req, res) => {
  try {
    const user = req.user;

    console.log(user);
    return sendSuccess(res, HTTP.OK, "token verified successfully", user);
  } catch (err) {
    return sendError(
      res,
      HTTP.INTERNAL_SERVER_ERROR,
      "something went wrong",
      err,
    );
  }
});

module.exports = testRouter;
