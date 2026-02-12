const mongoose = require("mongoose");

const claimSchema = new mongoose.Schema({
    needId: { type: mongoose.Schema.Types.ObjectId, ref: "Need", required: true },
    claimerWallet: { type: String, required: true },
    proofDescription: { type: String, default: "" },
    proofImage: { type: String, default: "" },
    aiVerified: { type: Boolean, default: false },
    aiConfidence: { type: Number, default: 0 },
    aiReason: { type: String, default: "" },
    txId: { type: String, default: null },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Claim", claimSchema);
