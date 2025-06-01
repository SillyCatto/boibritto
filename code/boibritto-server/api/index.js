// entry point for vercel

const connectDB = require("./config/database");
const app = require("./app");

module.exports = async (req, res) => {
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
