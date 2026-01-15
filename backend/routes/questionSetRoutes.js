const express = require("express");
const router = express.Router();
const {
  createQuestionSet,
  getQuestionSet,
  getDashboardData,
} = require("../controllers/questionSetController");

router.post("/", createQuestionSet);
router.get("/:code", getQuestionSet);
router.get("/dashboard/:code", getDashboardData);

module.exports = router;
