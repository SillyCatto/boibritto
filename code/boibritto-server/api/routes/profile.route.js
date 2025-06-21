const express = require("express");
const { ProfileController } = require("../controllers/profile.controller");
const profileRoute = express.Router();

profileRoute.get("/me", ProfileController.getCurrentProfile);

module.exports = profileRoute;
