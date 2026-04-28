const express = require("express");
const router = express.Router();
const { generateQuestions } = require("../controllers/aiController");

// POST /api/ai/generate
router.post("/generate", generateQuestions);

module.exports = router;