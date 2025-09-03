import express from "express";
import { ProfileController } from "../controllers/profile.controller.js";
const profileRoute = express.Router();

profileRoute.get("/", ProfileController.getAllProfiles);
profileRoute.get("/me", ProfileController.getCurrentProfile);
profileRoute.patch("/me", ProfileController.updateCurrentProfile);
profileRoute.get("/:userID", ProfileController.getPublicProfile);

export default profileRoute;
