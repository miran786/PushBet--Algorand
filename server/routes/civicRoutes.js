const { verifyCleanliness, getPendingSubmissions, approveSubmission, rejectSubmission, getAssignedVerifications, submitVote } = require("../controllers/civicController");

router.post("/verify-cleanliness", verifyCleanliness);
router.get("/pending", getPendingSubmissions);
router.post("/approve", approveSubmission);
router.post("/reject", rejectSubmission);

// Validator Node Routes
router.get("/validator/assignments", getAssignedVerifications);
router.post("/validator/vote", submitVote);

module.exports = router;
