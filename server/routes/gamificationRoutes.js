const express = require("express");
const router = express.Router();
const { mintBurnTokens } = require("../controllers/burnController");
const { mintCarbonNFT } = require("../controllers/nftController");
const { getTrustScore, updateTrustScore } = require("../controllers/sbtController");

router.post("/burn/mint", mintBurnTokens);
router.post("/nft/mint", mintCarbonNFT);
router.get("/trust/score", getTrustScore);
router.post("/trust/update", updateTrustScore);

module.exports = router;
