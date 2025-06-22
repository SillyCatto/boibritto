import mongoose from 'mongoose';

const collectionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String, maxlength: 200 },
    books: [
      {
        volumeId: { type: String, required: true, maxLength: 100 }, // Google Books ID
        addedAt: { type: Date, default: Date.now },
      },
    ],
    tags: [String],
    visibility: {
      type: String,
      enum: ["private", "friends", "public"],
      default: "public",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Collection", collectionSchema);
