const mongoose = require("mongoose");


// will update the admin model latter

const adminSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        role: { type: String, enum: ["superadmin", "moderator"], default: "moderator" },
        permissions: [String],
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Admin", adminSchema);