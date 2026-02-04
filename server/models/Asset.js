const mongoose = require("mongoose");

const assetSchema = new mongoose.Schema({
    itemId: { type: String, required: true },
    borrower: { type: String, required: true },
    depositTxId: { type: String, required: true },
    status: { type: String, enum: ["borrowed", "returned"], default: "borrowed" },
    timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Asset", assetSchema);
