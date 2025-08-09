import mongoose from 'mongoose';
import {  GENRES  } from '../utils/constants.js';


const blogSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        title: { type: String, required: true, maxlength: 100 },
        content: { type: String, required: true, maxlength: 3000 },
        visibility: {
            type: String,
            enum: ["private", "friends", "public"],
            default: "public"
        },
        spoilerAlert: { type: Boolean, required: true },
        genres: {
            type: [String],
            enum: GENRES,
            default: []
        }
    },
    { timestamps: true }
);

export default mongoose.model("Blog", blogSchema);