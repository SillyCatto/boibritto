const mongoose = require("mongoose");
const { GENRES } = require("../utils/constants");
const userSchema = new mongoose.Schema({
        uid: { type: String, required: true, unique: true }, // Firebase UID
        email: { type: String, required: true, unique: true },
        username: { type: String, required: true, unique: true },
        displayName: { type: String, required: true, unique: true },
        bio: { type: String, maxlength: 500 },
        avatar: { type: String }, // from Firebase Google avatar
        interestedGenres: {
            type: [String],
            enum: GENRES,
            default: []
        }
    },
    { timestamps: true }
);
module.exports = mongoose.model("User", userSchema);