const User = require("../models/User");

// Award a badge to a user
exports.awardBadge = async (req, res) => {
    try {
        const { walletAddress, badgeId } = req.body;
        if (!walletAddress || !badgeId) {
            return res.status(400).json({ success: false, message: "walletAddress and badgeId required" });
        }

        const user = await User.findOne({ walletAddress });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Check if user already has this badge
        if (user.badges.includes(badgeId)) {
            return res.json({ success: true, message: "Badge already awarded", badges: user.badges });
        }

        user.badges.push(badgeId);
        await user.save();

        res.json({ success: true, message: "Badge awarded successfully", badges: user.badges });
    } catch (error) {
        console.error("Award badge error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Get all badges for a user
exports.getUserBadges = async (req, res) => {
    try {
        const { walletAddress } = req.params;
        const user = await User.findOne({ walletAddress });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.json({ success: true, badges: user.badges || [] });
    } catch (error) {
        console.error("Get badges error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
