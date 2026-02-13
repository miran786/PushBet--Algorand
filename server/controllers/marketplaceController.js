const Need = require("../models/Need");
const Claim = require("../models/Claim");

// Mock Gemini Model (Always returns null since we are in demo mode)
function getGeminiModel() {
    return null;
}

// POST /needs — Create a new need
exports.createNeed = async (req, res) => {
    try {
        const { description, reward, requesterWallet, escrowTxId } = req.body;
        if (!description || !reward || !requesterWallet) {
            return res.status(400).json({ success: false, message: "description, reward, and requesterWallet are required" });
        }

        let category = "general";
        let aiTerms = "Submit a photo or description as proof of completion.";

        const need = await Need.create({
            requesterWallet,
            escrowTxId, // Save TxID
            description,
            reward,
            category,
            aiTerms
        });

        res.json({
            success: true,
            need,
            message: "Need created (Mock AI)"
        });
    } catch (err) {
        console.error("[Marketplace] createNeed error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// GET /needs — List all open needs
exports.getNeeds = async (req, res) => {
    try {
        const needs = await Need.find({ status: { $in: ["open", "claimed"] } })
            .sort({ createdAt: -1 })
            .limit(50);
        res.json({ success: true, needs });
    } catch (err) {
        console.error("[Marketplace] getNeeds error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// GET /needs/:id — Get a single need with claims
exports.getNeed = async (req, res) => {
    try {
        const need = await Need.findById(req.params.id);
        if (!need) return res.status(404).json({ success: false, message: "Need not found" });

        const claims = await Claim.find({ needId: need._id }).sort({ createdAt: -1 });
        res.json({ success: true, need, claims });
    } catch (err) {
        console.error("[Marketplace] getNeed error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// POST /needs/:id/claim — Claim a need
exports.claimNeed = async (req, res) => {
    try {
        const { claimerWallet } = req.body;
        if (!claimerWallet) {
            return res.status(400).json({ success: false, message: "claimerWallet is required" });
        }

        const need = await Need.findById(req.params.id);
        if (!need) return res.status(404).json({ success: false, message: "Need not found" });
        if (need.status !== "open") return res.status(400).json({ success: false, message: "Need is not open" });
        if (need.requesterWallet === claimerWallet) {
            return res.status(400).json({ success: false, message: "Cannot claim your own need" });
        }

        need.status = "claimed";
        need.claimedBy = claimerWallet;
        await need.save();

        res.json({ success: true, need, message: "Need claimed successfully" });
    } catch (err) {
        console.error("[Marketplace] claimNeed error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// POST /needs/:id/submit-proof — Submit proof for AI verification
exports.submitProof = async (req, res) => {
    try {
        const { claimerWallet, proofDescription, proofImage } = req.body;
        if (!claimerWallet || !proofDescription) {
            return res.status(400).json({ success: false, message: "claimerWallet and proofDescription are required" });
        }

        const need = await Need.findById(req.params.id);
        if (!need) return res.status(404).json({ success: false, message: "Need not found" });
        if (need.status !== "claimed") return res.status(400).json({ success: false, message: "Need must be claimed first" });

        let aiVerified = false;
        let aiReason = "Mock Mode: Manual verification required.";

        const claim = await Claim.create({
            needId: need._id,
            claimerWallet,
            proofDescription,
            proofImage: proofImage ? "(image submitted)" : "",
            aiVerified,
            aiReason
        });

        res.json({
            success: true,
            verified: aiVerified,
            claim,
            message: "Proof submitted (Mock AI)"
        });
    } catch (err) {
        console.error("[Marketplace] submitProof error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// POST /chat — Mock Demo Version
exports.chat = async (req, res) => {
    try {
        const { messages } = req.body;
        const userMsgs = messages.filter(m => m.role === 'user');
        const count = userMsgs.length;
        const lastMsg = userMsgs[userMsgs.length - 1].content;

        let reply = "";
        let contract = null;

        // Specific Demo Script Requested by User:
        // 1. User: "I need textbook of CS-AI Branch of Networking"
        // 2. AI: "Ok, how much token are you offering ??"
        // 3. User: "10"
        // 4. AI: Contract + Payment

        if (count === 1) {
            // First reply
            reply = "Ok, how much token are you offering ??";
        } else {
            // Second reply (or any subsequent) -> Finalize with "10" tokens
            reply = "Perfect! I have generated a smart contract based on your requirements. Please review and sign below.";

            // Extract reward from message (e.g. "10")
            const rewardMatch = lastMsg.match(/(\d+)/);
            const reward = rewardMatch ? parseFloat(rewardMatch[0]) : 10;

            contract = {
                description: userMsgs[0].content, // "textbook of CS-AI..."
                reward: reward,
                category: "textbook"
            };
        }

        res.json({ success: true, reply, contract });
    } catch (err) {
        console.error("[Marketplace] Chat error:", err);
        res.status(500).json({ success: false, message: "Chat Error: " + err.message });
    }
};
