const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/marketplaceController");

// Create a new need
router.post("/needs", ctrl.createNeed);

// List all open needs
router.get("/needs", ctrl.getNeeds);

// Get a single need with claims
router.get("/needs/:id", ctrl.getNeed);

// Claim a need
router.post("/needs/:id/claim", ctrl.claimNeed);

// Submit proof for AI verification
router.post("/needs/:id/submit-proof", ctrl.submitProof);

// Chat negotiation
router.post("/chat", ctrl.chat);

module.exports = router;
