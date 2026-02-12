const mongoose = require("mongoose");

const needSchema = new mongoose.Schema({
    requesterWallet: { type: String, required: true },
    description: { type: String, required: true },
    reward: { type: Number, required: true },
    status: {
        type: String,
        enum: ["open", "claimed", "verifying", "completed", "expired"],
        default: "open"
    },
    category: { type: String, default: "general" },
    aiTerms: { type: String, default: "" },
    claimedBy: { type: String, default: null },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, default: () => new Date(Date.now() + 48 * 60 * 60 * 1000) }
});

module.exports = mongoose.model("Need", needSchema);
