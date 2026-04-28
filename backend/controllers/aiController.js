const { GoogleGenerativeAI } = require("@google/generative-ai");

const MODEL_NAME = "gemini-2.5-flash";

function parseQuestions(text) {
  const cleaned = text.replace(/```json|```/gi, "").trim();
  const jsonMatch = cleaned.match(/\[[\s\S]*\]/);

  if (!jsonMatch) {
    throw new Error("AI response did not contain a JSON array.");
  }

  const parsed = JSON.parse(jsonMatch[0]);
  if (!Array.isArray(parsed)) {
    throw new Error("AI response JSON was not an array.");
  }

  return parsed;
}

function normalizeQuestion(question, defaults) {
  const keywords = question.keywords || question.expectedKeyPoints || question.keyPoints || [];
  const options = Array.isArray(question.options)
    ? question.options.map((option) => String(option).trim()).filter(Boolean)
    : [];

  return {
    question: String(question.question || "").trim(),
    keywords: Array.isArray(keywords)
      ? keywords.map((keyword) => String(keyword).trim()).filter(Boolean)
      : [],
    difficulty: defaults.difficulty,
    questionType: defaults.questionType,
    maxScore: defaults.maxScore,
    options: defaults.questionType === "mcq" ? options : [],
    correctAnswer: defaults.questionType === "mcq" ? String(question.correctAnswer || "").trim() : "",
    explanation: String(question.explanation || "").trim(),
    aiGenerated: true,
  };
}

function countWords(text) {
  return String(text || "").trim().split(/\s+/).filter(Boolean).length;
}

exports.generateQuestions = async (req, res) => {
  try {
    const {
      topic,
      difficulty = "easy",
      questionType = "long",
      count = 2,
      maxScore = 10,
    } = req.body || {};

    const cleanTopic = String(topic || "").trim();
    const questionCount = Math.max(1, Math.min(5, Number.parseInt(count, 10) || 2));
    const score = Math.max(1, Number.parseInt(maxScore, 10) || 10);
    const normalizedType = questionType === "mcq" ? "mcq" : "long";

    if (!cleanTopic) {
      return res.status(400).json({ error: "Topic is required." });
    }

    if (!process.env.GOOGLE_API_KEY) {
      return res.status(400).json({
        error: "Google API key is not configured.",
        solution: "Add GOOGLE_API_KEY to backend/.env and restart the backend server.",
      });
    }

    const client = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = client.getGenerativeModel({
      model: MODEL_NAME,
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    });

    const typeInstructions =
      normalizedType === "mcq"
        ? `For each question include:
- "question": string
- "keywords": array of 3-5 short scoring keywords
- "options": array of exactly 4 answer options
- "correctAnswer": exact text of the correct option
- "explanation": one short explanation`
        : `For each question include:
- "question": string
- "keywords": array of 3-5 short scoring keywords`;

    const prompt = `Generate exactly ${questionCount} professional assessment questions.
Topic: ${cleanTopic}
Difficulty: ${difficulty}
Question type: ${normalizedType === "mcq" ? "MCQ" : "Long Answer"}
Max score per question: ${score}

${typeInstructions}

Every "question" must be short and contain 12 words or fewer.

Return only a valid JSON array. Do not include markdown or extra text.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const questions = parseQuestions(text)
      .map((question) =>
        normalizeQuestion(question, {
          difficulty,
          questionType: normalizedType,
          maxScore: score,
        })
      )
      .filter((question) => question.question);

    const longQuestionsOverLimit = questions.filter(
      (question) => question.questionType === "long" && countWords(question.question) > 12
    );

    if (longQuestionsOverLimit.length > 0) {
      return res.status(502).json({
        error: "AI generated long questions that were too long. Please try again.",
        solution: "Long-answer question text must be 12 words or fewer.",
      });
    }

    if (questions.length === 0) {
      return res.status(502).json({
        error: "AI did not return usable questions. Please try again.",
      });
    }

    res.json({ questions });
  } catch (error) {
    console.error("AI generation failed:", {
      message: error.message,
      status: error.status,
      statusText: error.statusText,
    });

    let response = {
      error: "AI question generation failed.",
      solution: error.message || "Please try again.",
    };
    let statusCode = 500;

    if (error.status === 404 || error.message?.toLowerCase().includes("not found")) {
      response = {
        error: "AI model is not available.",
        solution: `The configured model (${MODEL_NAME}) is not available for this API key. Create a fresh Google AI API key, update backend/.env, and restart the backend.`,
      };
      statusCode = 502;
    } else if (error.status === 401 || error.message?.includes("Unauthenticated")) {
      response = {
        error: "Google API authentication failed.",
        solution: "Your GOOGLE_API_KEY is invalid or expired. Create a new Google AI API key and restart the backend.",
      };
      statusCode = 401;
    } else if (error.status === 403) {
      response = {
        error: "Google API permission denied.",
        solution: "Make sure the key has access to the configured AI model and that the API is enabled for it.",
      };
      statusCode = 403;
    } else if (error.status === 429) {
      response = {
        error: "AI rate limit exceeded.",
        solution: "Wait a moment and try again.",
      };
      statusCode = 429;
    }

    res.status(statusCode).json(response);
  }
};
