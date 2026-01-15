const express = require("express");
const router = express.Router();
const {
  createCandidate,
  submitAnswer,
  completeCandidate,
  updateStatus,
} = require("../controllers/candidateController");

router.post("/", createCandidate);
router.post("/answer", submitAnswer);
router.put("/:id/complete", completeCandidate);
router.put("/:id/status", updateStatus);

module.exports = router;
