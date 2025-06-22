import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
    {
        discussion: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Discussion",
            required: true
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        content: {
            type: String,
            required: true,
            maxlength: 500
        },
        spoilerAlert: { type: Boolean, required: true },
    },
    { timestamps: true }
);

export default mongoose.model("Comment", commentSchema);