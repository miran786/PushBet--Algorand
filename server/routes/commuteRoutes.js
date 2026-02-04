const express = require("express");
const router = express.Router();
const { completeRide } = require("../controllers/commuteController");

router.post("/complete-ride", completeRide);

module.exports = router;
