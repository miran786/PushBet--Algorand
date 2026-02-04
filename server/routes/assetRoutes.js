const express = require("express");
const router = express.Router();
const { borrowItem } = require("../controllers/assetController");

router.post("/borrow", borrowItem);

module.exports = router;
