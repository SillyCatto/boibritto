import "dotenv/config";
import mongoose from "mongoose";

const uri = process.env.MONGODB_URL || "";

const connectDB = async () => {
  await mongoose.connect(uri);
};

export default connectDB;
