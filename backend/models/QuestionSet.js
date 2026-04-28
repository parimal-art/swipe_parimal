const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  difficulty: { type: String, required: true, enum: ["easy", "medium", "hard"] },
  question: { type: String, required: true },
  // "long" = existing text answer, "mcq" = multiple choice
  questionType: { type: String, default: "long", enum: ["long", "mcq"] },
  keywords: { type: Array, default: [] },
  maxScore: { type: Number, default: 10 },

  // MCQ-specific fields
  options: { type: Array, default: [] },         // ["Option A", "Option B", ...]
  correctAnswer: { type: String, default: "" },  // exact text of correct option
  explanation: { type: String, default: "" },    // explanation shown after answer

  // Meta
  aiGenerated: { type: Boolean, default: false },
  sampleAnswer: { type: String, default: "" },
}, { _id: false });

const QuestionSetSchema = new mongoose.Schema({
  interviewCode: { type: String, required: true, unique: true },
  dashboardCode: { type: String, required: true },
  questions: { type: [QuestionSchema], required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("QuestionSet", QuestionSetSchema);