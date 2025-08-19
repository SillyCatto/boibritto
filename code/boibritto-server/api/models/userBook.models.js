import mongoose from "mongoose";
import { GENRES } from "../utils/constants.js";

const userBookSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 500,
    },
    synopsis: {
      type: String,
      maxlength: 1000,
    },
    genres: {
      type: [String],
      enum: GENRES,
      default: [],
    },
    visibility: {
      type: String,
      enum: ["private", "public"],
      default: "private",
    },
    coverImage: {
      type: String,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("UserBook", userBookSchema);
