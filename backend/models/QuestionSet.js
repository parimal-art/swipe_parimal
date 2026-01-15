const mongoose = require("mongoose");

const QuestionSetSchema = new mongoose.Schema({
  interviewCode: { type: String, required: true, unique: true },
  dashboardCode: { type: String, required: true },
  questions: { type: Array, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("QuestionSet", QuestionSetSchema);
