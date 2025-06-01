// used for local dev

require("dotenv").config();
const connectDB = require("./config/database");
const app = require("./app");

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB();
    console.log("✅ DB connected successfully!");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ DB connection failed: ", err);
    process.exit(1);
  }
};

startServer().catch((err) => {
  console.error("❌ uncaught error in server startup: ", err);
  process.exit(1);
});
