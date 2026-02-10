const { executePayout } = require("./gameController");
const algosdk = require("algosdk");

// Hardcoded for Demo (Replace with real Asset ID after deployment)
const BURN_ASSET_ID = 12345678;

// Mint (Transfer) $BURN tokens to user
const mintBurnTokens = async (req, res) => {
    const { walletAddress, calories } = req.body;

    if (!walletAddress || !calories) {
        return res.status(400).json({ message: "Missing data" });
    }

    // 1 $BURN per 100 Calories
    const tokensToMint = Math.floor(calories / 100);

    if (tokensToMint < 1) {
        return res.status(200).json({
            message: "Keep pushing! You need 100 kcal for 1 $BURN.",
            minted: 0
        });
    }

    console.log(`Minting ${tokensToMint} $BURN for ${walletAddress} (Calories: ${calories})`);

    try {
        // In a real scenario, this would send an ASA (Algorand Standard Asset)
        // For this demo, we will simulate it or send a 0 ALGO txn with Note
        // const txId = await transferAsset(walletAddress, BURN_ASSET_ID, tokensToMint);

        // Mocking the ASA Transfer for now to avoid setup complexity during hackathon demo
        // We can just rely on the database or frontend to show "Pending" if we don't have the asset yet.
        // OR we can send a 0.000001 ALGO txn as a "Token Placeholder"

        const txId = await executePayout(walletAddress, 1); // executePayout defaults to ALGO, sending 1 microAlgo as marker

        res.status(200).json({
            message: `Minted ${tokensToMint} $BURN Tokens!`,
            minted: tokensToMint,
            txId: txId || "TX_MOCK_123"
        });

    } catch (error) {
        console.error("Minting failed:", error);
        res.status(500).json({ message: "Minting failed" });
    }
};

module.exports = {
    mintBurnTokens
};
