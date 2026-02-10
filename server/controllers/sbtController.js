const User = require("../models/User");

// Get Trust Score
const getTrustScore = async (req, res) => {
    const { walletAddress } = req.query;
    try {
        let user = await User.findOne({ walletAddress });
        if (!user) {
            return res.status(200).json({ trustScore: 50 }); // Default
        }
        res.status(200).json({ trustScore: user.trustScore });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch trust score" });
    }
};

// Update Trust Score (Internal Helper, can be exposed if secured)
const updateTrustScoreInternal = async (walletAddress, points, reason) => {
    try {
        let user = await User.findOne({ walletAddress });
        if (!user) {
            user = new User({ walletAddress, trustScore: 50 });
        }
        user.trustScore += points;
        await user.save();
        console.log(`Trust Score Updated for ${walletAddress}: +${points} (${reason}) => New Score: ${user.trustScore}`);
        return user.trustScore;
    } catch (error) {
        console.error("Failed to update trust score:", error);
    }
};

// API Endpoint to manually trigger update (for Hackathon Demo flexibility)
const updateTrustScore = async (req, res) => {
    const { walletAddress, points, reason } = req.body;
    const newScore = await updateTrustScoreInternal(walletAddress, points, reason);
    res.status(200).json({ trustScore: newScore, message: "Trust Score Updated" });
};

module.exports = {
    getTrustScore,
    updateTrustScore,
    updateTrustScoreInternal
};
