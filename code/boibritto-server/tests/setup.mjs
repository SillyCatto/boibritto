import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import connectDB from "../api/config/database.js";

beforeAll(async () => {
  await connectDB();
  console.log("✅  DB connected for testing");
});

afterAll(async () => {
  await mongoose.disconnect();
  console.log("🛑 DB disconnected");
});
