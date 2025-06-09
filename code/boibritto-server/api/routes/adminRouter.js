const express = require("express");

const mongoose = require("mongoose");

const { sendSuccess, sendError } = require("../utils/response");
const HTTP = require("../utils/httpStatus");

const adminRouter = express.Router();

module.exports = adminRouter;
