// entry point for vercel

import connectDB from "./config/database.config.js";
import app from "./app.js";

// Global flag to ensure single initialization
let initialized = false;

export default async (req, res) => {
  // Only initialize once per serverless function instance
  if (!initialized) {
    try {
      // Connect to database
      if (!global.dbConnected) {
        await connectDB();
        global.dbConnected = true;
        console.log("✅ DB connected successfully!");
      }

      initialized = true;
    } catch (err) {
      console.error("❌ Initialization failed: ", err);
      return res.status(500).json({ error: "Server initialization failed" });
    }
  }

  return app(req, res);
};