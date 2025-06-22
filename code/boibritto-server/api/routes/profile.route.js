import express from 'express';
import {  ProfileController  } from '../controllers/profile.controller.js';
const profileRoute = express.Router();

profileRoute.get("/me", ProfileController.getCurrentProfile);

export default profileRoute;
