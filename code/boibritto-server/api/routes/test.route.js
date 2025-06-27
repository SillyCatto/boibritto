import express from 'express';
import verifyFirebaseToken from '../middlewares/verifyUser.js';
import {  sendSuccess, sendError  } from '../utils/response.js';
import HTTP from '../utils/httpStatus.js';

const testRoute = express.Router();

// test regular route
testRoute.get("/ping", (req, res) => {
  res.status(HTTP.OK).send("pong");
});

// test protected
testRoute.get("/protected", verifyFirebaseToken, (req, res) => {
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

export default testRoute;
