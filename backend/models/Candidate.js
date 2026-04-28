const mongoose = require("mongoose");

const CandidateSchema = new mongoose.Schema({
  interviewCode: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  status: { type: String, default: "in_progress" },
  finalScore: { type: Number, default: 0 },

  answers: [
    {
      questionId: String,
      questionType: { type: String, default: "long" }, // "long" or "mcq"
      answer: String,           // For long: text. For MCQ: selected option text
      isCorrect: Boolean,       // For MCQ: true/false
      matchedKeywords: Array,   // For long answers
      score: Number,
    },
  ],

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Candidate", CandidateSchema);