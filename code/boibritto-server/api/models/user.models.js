import mongoose from "mongoose";
import { GENRES } from "../utils/constants.js";

const userSchema = new mongoose.Schema(
  {
    uid: { type: String, required: true, unique: true }, // Firebase UID
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true }, // unique alias for the platform (ask in signup page)
    displayName: { type: String, required: true }, // from firebase "name"
    bio: { type: String, maxlength: 500 },
    avatar: { type: String }, // from Firebase Google avatar
    interestedGenres: {
      type: [String],
      enum: GENRES,
      default: [],
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
