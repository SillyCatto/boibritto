// used for local dev

import "dotenv/config";
import connectDB from "./config/database.config.js";
import app from "./app.js";

import { logInfo, logError } from "./utils/logger.js";

const PORT = process.env.PORT || 5001;

const listen = () => {
  app.listen(PORT, () => {
    logInfo(`Server running on http://localhost:${PORT}`);
  });
};

const startServer = async () => {
  try {
    await connectDB();
    logInfo("DB connected successfully!");
    listen();
  } catch (err) {
    logError("DB connection failed", err);
    process.exit(1);
  }
};

startServer().catch((err) => {
  logError("Uncaught error in server startup", err);
  process.exit(1);
});
