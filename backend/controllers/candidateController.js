const Candidate = require("../models/Candidate");

// Create Candidate
exports.createCandidate = async (req, res) => {
  try {
    const candidate = new Candidate(req.body);
    await candidate.save();
    res.status(201).json({ id: candidate._id, ...candidate._doc });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Push Answer (supports both long and MCQ)
exports.submitAnswer = async (req, res) => {
  const { candidateId, ...answerData } = req.body;

  try {
    if (!candidateId) {
      return res.status(400).json({ error: "candidateId is required" });
    }

    const candidate = await Candidate.findByIdAndUpdate(
      candidateId,
      { $push: { answers: answerData } },
      { new: true }
    );

    if (!candidate) {
      return res.status(404).json({ error: "Candidate not found" });
    }

    res.json(answerData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Complete Interview
exports.completeCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findByIdAndUpdate(
      req.params.id,
      { finalScore: req.body.score, status: "completed" },
      { new: true }
    );
    res.json(candidate);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Status
exports.updateStatus = async (req, res) => {
  try {
    const candidate = await Candidate.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(candidate);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
