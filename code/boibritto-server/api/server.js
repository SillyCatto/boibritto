// used for local dev

require("dotenv").config();
const connectDB = require("./config/database");
const app = require("./app");

const { logInfo, logError } = require("./utils/logger");

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
