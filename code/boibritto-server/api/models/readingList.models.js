import mongoose from 'mongoose';

const readingListSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    volumeId: { type: String, required: true, maxLength: 100 }, // Google Books ID
    genres: [{ type: String, trim: true }], // Array of book genres for recommendations
    status: {
      type: String,
      enum: ["interested", "reading", "completed"],
      required: true,
    },
    startedAt: {
      type: Date,
      validate: {
        validator: function (value) {
          if (this.status === "reading" || this.status === "completed") {
            return value instanceof Date;
          }
          return true;
        },
        message:
          "Started date is required when status is 'reading' or 'completed'.",
      },
    },
    completedAt: {
      type: Date,
      validate: {
        validator: function (value) {
          if (this.status === "completed") {
            return value instanceof Date;
          }
          return true;
        },
        message: "Completed date is required when status is 'completed'.",
      },
    },
    visibility: {
      type: String,
      enum: ["private", "friends", "public"],
      default: "public",
    },
  },
  { timestamps: true },
);

// compound unique index to prevent duplicate entry
readingListSchema.index({ user: 1, volumeId: 1 }, { unique: true });

export default mongoose.model("ReadingList", readingListSchema);
