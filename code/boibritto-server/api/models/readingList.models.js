const mongoose = require("mongoose");

const readingListSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        volumeId: { type: String, required: true }, // Google Books ID
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
                message: "Started date is required when status is 'reading' or 'completed'.",
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
        visibility: { type: String, enum: ["private", "friends", "public"], default: "public" },
    },
    { timestamps: true }
);

module.exports = mongoose.model("ReadingList", readingListSchema);