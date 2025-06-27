import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema(
  {
    uid: { type: String, required: true, unique: true }, // Firebase UID
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true }, // Admin full name
    avatar: { type: String }, // optional

    role: {
      type: String,
      enum: ["superadmin", "moderator"],
      default: "moderator",
    },

    permissions: {
      type: [String],
      default: [], // ex- ["manageUsers", "reviewReports"]
    },
  },
  { timestamps: true },
);

export default mongoose.model("Admin", adminSchema);
