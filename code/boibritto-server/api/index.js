// entry point for vercel

import connectDB from "./config/database.config.js";
import app from "./app.js";

export default async (req, res) => {
  if (!global.dbConnected) {
    try {
      await connectDB();
      global.dbConnected = true;
      console.log("✅ DB connected successfully!");
    } catch (err) {
      console.error("❌ DB connection failed: ", err);
      return res.status(500).json({ error: "Database connection failed" });
    }
  }

  return app(req, res);
};
