import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    discussion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Discussion",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 500,
    },
    spoilerAlert: { type: Boolean, required: true },
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null, // null means it's a top-level comment
    },
  },
  { timestamps: true }
);

// Add validation to ensure only 1-level deep nesting
commentSchema.pre("save", async function (next) {
  if (this.parentComment) {
    // Check if the parent comment itself has a parent (which would make this 2+ levels deep)
    const parentComment = await mongoose
      .model("Comment")
      .findById(this.parentComment);
    if (parentComment && parentComment.parentComment) {
      const error = new Error(
        "Comments can only be 1 level deep (replies to replies are not allowed)"
      );
      return next(error);
    }
  }
  next();
});

export default mongoose.model("Comment", commentSchema);
