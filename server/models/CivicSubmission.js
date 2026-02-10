const mongoose = require('mongoose');

const CivicSubmissionSchema = new mongoose.Schema({
    walletAddress: {
        type: String,
        required: true,
    },
    imageUrl: {
        type: String,
        required: true,
    },
    aiConfidence: {
        type: Number,
        required: true,
    },
    aiStatus: {
        type: String,
        enum: ['clean', 'messy'],
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'flagged'], // Added 'flagged' for hybrid review
        default: 'pending',
    },
    verifiers: [{ type: String }], // Array of wallet addresses
    votes: [{
        verifier: String,
        vote: { type: String, enum: ['clean', 'messy'] },
        timestamp: { type: Date, default: Date.now }
    }],
    consensusStatus: {
        type: String,
        enum: ['waiting', 'reached', 'failed'],
        default: 'waiting'
    },
    payoutTxId: {
        type: String,
        default: null,
    },
    adminComment: {
        type: String,
        default: '',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('CivicSubmission', CivicSubmissionSchema);
