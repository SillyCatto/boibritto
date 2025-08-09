import mongoose from 'mongoose';

const collectionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, maxlength: 100 },
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

// max book per collection <= 100
collectionSchema.path('books').validate(function (books) {
    return books.length <= 100;
}, 'A collection can have at most 100 books.');

export default mongoose.model("Collection", collectionSchema);
