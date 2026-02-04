const { executePayout } = require("./gameController");

const completeRide = async (req, res) => {
    const { walletAddress } = req.body;

    if (!walletAddress) {
        return res.status(400).json({ message: "Wallet address required" });
    }

    console.log(`Completing ride for ${walletAddress}...`);

    try {
        // Trigger Algorand Payout (Reimbursement)
        const txId = await executePayout(walletAddress);

        if (txId) {
            console.log(`Ride Reimbursement sent: ${txId}`);
            return res.status(200).json({
                message: "Ride completed successfully. Reimbursement sent.",
                txId: txId
            });
        } else {
            return res.status(200).json({
                message: "Ride completed, but reimbursement failed (Check backend logs)."
            });
        }

    } catch (error) {
        console.error("Ride completion error:", error);
        res.status(500).json({ message: "Ride completion failed" });
    }
};

module.exports = {
    completeRide
};
