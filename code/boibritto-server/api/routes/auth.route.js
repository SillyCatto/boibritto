import express from "express";
import { AuthController } from "../controllers/auth.controller.js";

const authRoute = express.Router();

authRoute.get("/login", AuthController.loginUser);

authRoute.post("/signup", AuthController.signupUser);

export default authRoute;
