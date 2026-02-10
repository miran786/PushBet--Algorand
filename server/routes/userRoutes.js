const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

const auth = require("../middleware/authMiddleware");

router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/link-wallet", auth, userController.linkWallet);
router.post("/get-by-email", userController.getUserByEmail);
router.get("/leaderboard/all", userController.getLeaderboard);
router.get("/:id", userController.getUserById);

module.exports = router;
