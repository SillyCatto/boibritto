const mongoose = require("mongoose");
const { GENRES } = require("../utils/constants");

const discussionSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        title: { type: String, required: true },
        content: { type: String, required: true },
        topic: { type: String },
        visibility: {
            type: String,
            enum: ["friends", "public"],
            default: "public"
        },
        spoilerAlert: { type: Boolean, required: true },
        genres: {
            type: [String],
            enum: GENRES,
            default: []
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Discussion", discussionSchema);