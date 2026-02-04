const Asset = require("../models/Asset");

const borrowItem = async (req, res) => {
    const { itemId, borrower, depositTxId } = req.body;

    if (!itemId || !borrower || !depositTxId) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    console.log(`User ${borrower} borrowing item ${itemId} with deposit ${depositTxId}`);

    try {
        const newAsset = new Asset({
            itemId,
            borrower,
            depositTxId,
            status: "borrowed"
        });

        await newAsset.save();

        res.status(200).json({ message: "Borrow recorded successfully", asset: newAsset });
    } catch (error) {
        console.error("Error borrowing item:", error);
        res.status(500).json({ message: "Failed to borrow item", error });
    }
};

module.exports = {
    borrowItem
};
