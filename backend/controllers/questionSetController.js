const QuestionSet = require("../models/QuestionSet");
const Candidate = require("../models/Candidate");

// Create Question Set
exports.createQuestionSet = async (req, res) => {
  try {
    const newSet = new QuestionSet(req.body);
    await newSet.save();
    res.status(201).json(newSet);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Fetch by Interview Code
exports.getQuestionSet = async (req, res) => {
  try {
    const set = await QuestionSet.findOne({
      interviewCode: req.params.code.toUpperCase(),
    });

    if (!set) return res.status(404).json({ error: "Invalid Interview Code" });

    res.json(set);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Dashboard Data
exports.getDashboardData = async (req, res) => {
  try {
    const questionSet = await QuestionSet.findOne({
      dashboardCode: req.params.code.toUpperCase(),
    });

    if (!questionSet)
      return res.status(404).json({ error: "Invalid Dashboard Code" });

    const candidates = await Candidate.find({
      interviewCode: questionSet.interviewCode,
    });

    const formatted = candidates.map((c) => ({
      id: c._id,
      ...c._doc,
      final_score: c.finalScore,
      created_at: c.createdAt,
      interview_code: c.interviewCode,
      answers: c.answers.map((a) => ({
        question_id: a.questionId,
        answer: a.answer,
        score: a.score,
        matched_keywords: a.matchedKeywords,
      })),
    }));

    res.json({
      questionSet: {
        ...questionSet._doc,
        interview_code: questionSet.interviewCode,
      },
      candidates: formatted,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
