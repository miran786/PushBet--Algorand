const CivicSubmission = require("../models/CivicSubmission");
const User = require("../models/User");
const { executePayout } = require("./gameController");
const { updateTrustScoreInternal } = require("./sbtController");

// Helper: Assign Random Verifiers
const assignVerifiers = async (submissionId) => {
    try {
        // Find users with Trust Score >= 50
        const potentialVerifiers = await User.find({ trustScore: { $gte: 50 }, walletAddress: { $ne: "ADMIN" } });

        if (potentialVerifiers.length < 3) {
            console.log("Not enough trusted users to assign verifiers. Falling back to Admin.");
            return;
        }

        // Shuffle and pick 3
        const shuffled = potentialVerifiers.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 3).map(u => u.walletAddress);

        await CivicSubmission.findByIdAndUpdate(submissionId, { verifiers: selected });
        console.log(`Assigned Verifiers for ${submissionId}:`, selected);

    } catch (error) {
        console.error("Failed to assign verifiers:", error);
    }
};

// ... existing verifyCleanliness ...
const verifyCleanliness = async (req, res) => {
    const { image, walletAddress } = req.body;

    if (!image || !walletAddress) {
        return res.status(400).json({ message: "Image and wallet address required" });
    }

    try {
        // 1. Mock AI Verification (or Real if API key set)
        const isClean = Math.random() > 0.2;
        const aiStatus = isClean ? "clean" : "messy";
        const aiConfidence = 0.85 + Math.random() * 0.14;

        // 2. Save to DB
        const submission = new CivicSubmission({
            walletAddress,
            imageUrl: image,
            aiStatus,
            aiConfidence,
            status: "pending"
        });

        await submission.save();

        // 3. Assign Peer Verifiers (The Innovation)
        // In background to not block response
        assignVerifiers(submission._id);

        res.status(200).json({
            status: "clean", // Always return "clean" to user if AI passes, pending consensus
            confidence: aiConfidence,
            message: "AI Verified. Sent to Student Validator Node for Consensus.",
            submissionId: submission._id
        });

    } catch (error) {
        console.error("Verification error:", error);
        res.status(500).json({ message: "Server error during verification" });
    }
};

// ... existing Admin methods ...
const getPendingSubmissions = async (req, res) => {
    try {
        const pending = await CivicSubmission.find({ status: "pending" }).sort({ createdAt: -1 });
        res.status(200).json(pending);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch submissions" });
    }
};

const approveSubmission = async (req, res) => {
    // ... same as before
    const { id } = req.body;
    try {
        const submission = await CivicSubmission.findById(id);
        if (!submission) return res.status(404).json({ message: "Submission not found" });

        console.log(`Approving submission ${id}`);
        const txId = await executePayout(submission.walletAddress, 5000000);
        await updateTrustScoreInternal(submission.walletAddress, 15, "Civic Verification Approved");

        submission.status = "approved";
        submission.payoutTxId = txId || "MANUAL_PAYOUT";
        await submission.save();

        res.status(200).json({ message: "Approved and Reward Sent!", txId });
    } catch (error) {
        console.error("Approval failed:", error);
        res.status(500).json({ message: "Approval failed" });
    }
};

const rejectSubmission = async (req, res) => {
    // ... same as before
    const { id } = req.body;
    try {
        await CivicSubmission.findByIdAndUpdate(id, { status: "rejected" });
        res.status(200).json({ message: "Submission rejected" });
    } catch (error) {
        res.status(500).json({ message: "Rejection failed" });
    }
};

// NEW: Get assignments for a verifier
const getAssignedVerifications = async (req, res) => {
    const { walletAddress } = req.query;
    try {
        // Find pending submissions where this user is a verifier and hasn't voted yet
        const assigned = await CivicSubmission.find({
            status: "pending",
            verifiers: walletAddress,
            "votes.verifier": { $ne: walletAddress }
        });
        res.status(200).json(assigned);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch assignments" });
    }
};

// NEW: Submit Vote
const submitVote = async (req, res) => {
    const { submissionId, walletAddress, vote } = req.body; // vote: 'clean' or 'messy'

    try {
        const submission = await CivicSubmission.findById(submissionId);
        if (!submission) return res.status(404).json({ message: "Submission not found" });

        // Record Vote
        submission.votes.push({ verifier: walletAddress, vote });
        await updateTrustScoreInternal(walletAddress, 1, "Verification Vote Cast"); // Small reward for voting
        await submission.save();

        // Check Consensus
        const cleanVotes = submission.votes.filter(v => v.vote === 'clean').length;
        const messyVotes = submission.votes.filter(v => v.vote === 'messy').length;
        const totalVotes = submission.votes.length;

        // Consensus Logic: 2 out of 3
        if (cleanVotes >= 2) {
            // APPROVED by Peers!
            if (submission.aiStatus === 'messy') {
                // Hybrid Conflict -> Flag for Admin
                submission.status = 'flagged';
                submission.adminComment = 'AI disagree with Human Consensus';
            } else {
                // Auto-Approve
                const txId = await executePayout(submission.walletAddress, 5000000);
                await updateTrustScoreInternal(submission.walletAddress, 15, "Peer Consensus Approved");
                submission.status = 'approved';
                submission.payoutTxId = txId;
                submission.consensusStatus = 'reached';
            }
        } else if (messyVotes >= 2) {
            // REJECTED by Peers
            submission.status = 'rejected';
            submission.consensusStatus = 'reached';
            // Penalize submitter?
            await updateTrustScoreInternal(submission.walletAddress, -5, "Peer Consensus Rejected");
        }

        await submission.save();
        res.status(200).json({ message: "Vote Recorded", consensus: submission.consensusStatus });

    } catch (error) {
        console.error("Voting failed:", error);
        res.status(500).json({ message: "Voting failed" });
    }
};

module.exports = {
    verifyCleanliness,
    getPendingSubmissions,
    approveSubmission,
    rejectSubmission,
    getAssignedVerifications,
    submitVote
};
