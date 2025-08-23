import mongoose from "mongoose";

const chapterSchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserBook",
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 200,
    },
    content: {
      type: String,
      required: true,
      maxlength: 50000, // Generous limit for chapter content
    },
    chapterNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    visibility: {
      type: String,
      enum: ["private", "public"],
      default: "private",
    },
    wordCount: {
      type: Number,
      default: 0,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure unique chapter numbers per book
chapterSchema.index({ book: 1, chapterNumber: 1 }, { unique: true });

// Pre-save middleware to validate visibility logic
chapterSchema.pre("save", async function (next) {
  try {
    // Get the parent book to check its visibility
    const book = await mongoose.model("UserBook").findById(this.book);

    if (!book) {
      return next(new Error("Associated book not found"));
    }

    // If book is private, chapter cannot be public
    if (book.visibility === "private" && this.visibility === "public") {
      return next(
        new Error("Chapter cannot be public when the book is private")
      );
    }

    // Auto-calculate word count
    if (this.content) {
      this.wordCount = this.content.trim().split(/\s+/).length;
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Pre-update middleware for findOneAndUpdate operations
chapterSchema.pre("findOneAndUpdate", async function (next) {
  try {
    const update = this.getUpdate();

    // If visibility is being updated to public, check book visibility
    if (
      update.visibility === "public" ||
      (update.$set && update.$set.visibility === "public")
    ) {
      const chapter = await this.model.findOne(this.getQuery());
      if (chapter) {
        const book = await mongoose.model("UserBook").findById(chapter.book);
        if (book && book.visibility === "private") {
          return next(
            new Error("Chapter cannot be public when the book is private")
          );
        }
      }
    }

    // Auto-calculate word count if content is being updated
    const newContent = update.content || (update.$set && update.$set.content);
    if (newContent) {
      const wordCount = newContent.trim().split(/\s+/).length;
      if (update.$set) {
        update.$set.wordCount = wordCount;
      } else {
        update.wordCount = wordCount;
      }
    }

    next();
  } catch (error) {
    next(error);
  }
});

export default mongoose.model("Chapter", chapterSchema);
