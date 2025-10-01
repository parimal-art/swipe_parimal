// src/utils/evaluation.js

export function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function countWords(text) {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

export function evaluateAnswer(answer, keywords, maxScore = 10) {
  const normalizedAnswer = normalizeText(answer);
  const matchedKeywords = [];
  keywords.forEach(keyword => {
    const normalizedKeyword = normalizeText(keyword);
    if (normalizedAnswer.includes(normalizedKeyword)) {
      matchedKeywords.push(keyword);
    }
  });
  const keywordRatio = matchedKeywords.length / keywords.length;
  let score = keywordRatio * maxScore;

  const wordCount = countWords(answer);
  if (wordCount > 20) {
    score += 1;
  }

  score = Math.min(score, maxScore + 1);
  score = Math.round(score * 10) / 10;

  return {
    matchedKeywords,
    score,
    keywordRatio,
    wordCount,
  };
}

export function calculateFinalScore(answers, questions) {
  const difficultyWeights = {
    easy: 1,
    medium: 2,
    hard: 3,
  };
  let totalWeightedScore = 0;
  let totalWeight = 0;

  answers.forEach(answer => {
    const question = questions.find(q => q.id === answer.questionId);
    if (question) {
      const weight = difficultyWeights[question.difficulty] || 1;
      totalWeightedScore += answer.score * weight;
      totalWeight += weight;
    }
  });
  if (totalWeight === 0) return 0;

  const finalScore = (totalWeightedScore / totalWeight);
  return Math.round(finalScore * 10) / 10;
}

export function generateCode(length = 6) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function selectQuestions(allQuestions) {
  const easy = allQuestions.filter(q => q.difficulty === 'easy');
  const medium = allQuestions.filter(q => q.difficulty === 'medium');
  const hard = allQuestions.filter(q => q.difficulty === 'hard');
  const shuffle = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };
  const selected = [
    ...shuffle(easy).slice(0, 2),
    ...shuffle(medium).slice(0, 2),
    ...shuffle(hard).slice(0, 2),
  ];
  // The final shuffle is removed here to preserve the difficulty order
  return selected;
}

export function parseResumeText(text) {
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/;
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?)[-.\s]?\d{3}[-.\s]?\d{4}/;

  const emailMatch = text.match(emailRegex);
  const phoneMatch = text.match(phoneRegex);

  const email = emailMatch ? emailMatch[0] : null;
  const phone = phoneMatch ? phoneMatch[0] : null;

  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  let name = '';

  const nonNameKeywords = [
    'resume', 'cv', 'curriculum', 'vitae', 'profile', 'objective',
    'summary', 'address', 'linkedin', 'github', 'portfolio'
  ];

  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i];
    const lowerLine = line.toLowerCase();

    if ((email && lowerLine.includes(email.toLowerCase())) || (phone && lowerLine.includes(phone))) {
      continue;
    }

    const containsNonNameKeyword = nonNameKeywords.some(keyword => lowerLine.includes(keyword));
    if (containsNonNameKeyword) {
      continue;
    }
    
    const wordCount = line.split(' ').length;
    if (
      line.length >= 3 &&
      line.length <= 50 &&
      wordCount >= 2 &&
      wordCount <= 5 &&
      !/[|/\\]/.test(line)
    ) {
      name = line;
      break;
    }
  }

  return {
    name: name || null,
    email: email,
    phone: phone,
  };
}