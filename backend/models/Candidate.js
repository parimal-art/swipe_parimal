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
      answer: String,
      matchedKeywords: Array,
      score: Number,
    },
  ],

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Candidate", CandidateSchema);
