const mongoose = require("mongoose");

const connectionSchema = new mongoose.Schema(
    {
        from: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        to: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        status: {
            type: String,
            enum: ["pending", "accepted", "declined"],
            default: "pending",
        },
    },
    { timestamps: true }
);

// Prevent duplicate connection requests
connectionSchema.index({ from: 1, to: 1 }, { unique: true });

module.exports = mongoose.model("Connection", connectionSchema);