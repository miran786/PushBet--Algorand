const express = require("express");
const router = express.Router();
const { verifyCleanliness } = require("../controllers/civicController");

router.post("/verify-cleanliness", verifyCleanliness);

module.exports = router;
