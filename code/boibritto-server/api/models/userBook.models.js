const mongoose = require("mongoose");
const { GENRES } = require("../utils/constants");

const userBookSchema = new mongoose.Schema(
    {
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        title: {
            type: String,
            required: true
        },
        synopsis: {
            type: String,
            maxlength: 1000
        },
        genres: {
            type: [String],
            enum: GENRES,
            default: []
        },
        visibility: {
            type: String,
            enum: ["private", "friends", "public"],
            default: "private"
        },
        chapters: [
            {
                title: String,
                content: String, // store Markdown
                createdAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
        coverImage: {
            type: String
        },
        likes: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }]
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("UserBook", userBookSchema);