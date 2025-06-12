const express = require("express");
const router = express.Router();

const { AuthController } = require("../controllers/auth.controller");

router.get("/login", AuthController.loginUser);

router.post("/signup", AuthController.signupUser);

module.exports = router;
