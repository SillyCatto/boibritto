import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reportType: {
      type: String,
      enum: ["collection", "blog", "discussion", "comment", "userbook", "user"],
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      // This will reference different models based on reportType
    },
    reason: {
      type: String,
      enum: [
        "spam",
        "harassment",
        "hate_speech",
        "violence",
        "adult_content",
        "copyright_violation",
        "misinformation",
        "self_harm",
        "bullying",
        "impersonation",
        "other",
      ],
      required: true,
    },
    description: {
      type: String,
      maxlength: 200,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "under_review", "action_taken", "dismissed"],
      default: "pending",
    },
    adminNotes: {
      type: String,
      maxlength: 500,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate reports from same user for same content
reportSchema.index(
  { reporter: 1, targetId: 1, reportType: 1 },
  { unique: true }
);

// Index for admin queries
reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ reportType: 1, status: 1 });

export default mongoose.model("Report", reportSchema);
