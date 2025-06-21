const express = require("express");
const { AuthController } = require("../controllers/auth.controller");

const authRoute = express.Router();

authRoute.get("/login", AuthController.loginUser);

authRoute.post("/signup", AuthController.signupUser);

module.exports = authRoute;
