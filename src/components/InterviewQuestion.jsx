import { useState, useEffect } from 'react';
import { Clock, Send, AlertCircle } from 'lucide-react';

export default function InterviewQuestion({
  question,
  questionNumber,
  totalQuestions,
  timeLimit = 120,
  onSubmit,
  onTimeExpired,
}) {
  const [answer, setAnswer] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (submitted) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [submitted]);

  const handleAutoSubmit = () => {
    if (!submitted) {
      setSubmitted(true);
      onTimeExpired(answer);
    }
  };

  const handleSubmit = () => {
    if (!submitted) {
      setSubmitted(true);
      onSubmit(answer);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = () => {
    switch (question.difficulty) {
      case 'easy':
        return 'bg-emerald-100 text-emerald-700';
      case 'medium':
        return 'bg-amber-100 text-amber-700';
      case 'hard':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getTimeColor = () => {
    if (timeRemaining > 60) return 'text-emerald-600';
    if (timeRemaining > 30) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-slate-500 mb-1">
                Question {questionNumber} of {totalQuestions}
              </p>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getDifficultyColor()}`}>
                {question.difficulty.toUpperCase()}
              </span>
            </div>
            <div className={`flex items-center gap-2 text-2xl font-bold ${getTimeColor()}`}>
              <Clock className="w-6 h-6" />
              {formatTime(timeRemaining)}
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              {question.question}
            </h2>
            <p className="text-sm text-slate-500">
              Max Score: {question.maxScore} points
            </p>
          </div>

          {timeRemaining <= 30 && !submitted && (
            <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>Time is running out! Your answer will be auto-submitted when time expires.</span>
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Your Answer
            </label>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={submitted}
              placeholder="Type your answer here... Be detailed and include relevant keywords."
              rows="12"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100 disabled:cursor-not-allowed resize-none"
            />
            <div className="flex justify-between mt-2 text-sm text-slate-500">
              <span>{answer.trim().split(/\s+/).filter(w => w).length} words</span>
              <span>{answer.length} characters</span>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleSubmit}
              disabled={submitted || answer.trim().length === 0}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" />
              Submit Answer
            </button>
          </div>

          {submitted && (
            <div className="mt-6 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-center">
              Answer submitted successfully! Loading next question...
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <div className="inline-flex gap-2">
            {Array.from({ length: totalQuestions }).map((_, idx) => (
              <div
                key={idx}
                className={`w-3 h-3 rounded-full ${
                  idx < questionNumber - 1
                    ? 'bg-emerald-500'
                    : idx === questionNumber - 1
                    ? 'bg-blue-500'
                    : 'bg-slate-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
