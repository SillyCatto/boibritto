import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../api/config/database.config.js";
import { beforeAll, afterAll } from "vitest";

beforeAll(async () => {
  await connectDB();
  console.log("✅  DB connected for testing");
});

afterAll(async () => {
  await mongoose.disconnect();
  console.log("🛑 DB disconnected");
});
