const express = require("express");
const router = express.Router();
const {
  createQuestionSet,
  getQuestionSet,
  getDashboardData,
} = require("../controllers/questionSetController");

router.post("/", createQuestionSet);
router.get("/dashboard/:code", getDashboardData);
router.get("/:code", getQuestionSet);

module.exports = router;
