import express from "express";
import { ReportController } from "../controllers/report.controller.js";
import verifyUser from "../middlewares/verifyUser.js";

const reportRoute = express.Router();

// Submit a new report
reportRoute.post("/", verifyUser, ReportController.submitReport);

// Get user's submitted reports
reportRoute.get("/my-reports", verifyUser, ReportController.getUserReports);

export default reportRoute;
