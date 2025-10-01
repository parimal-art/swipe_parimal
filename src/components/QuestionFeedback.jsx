import { CheckCircle, XCircle, TrendingUp } from 'lucide-react';

export default function QuestionFeedback({ evaluation, question, onNext }) {
  const { matchedKeywords, score, keywordRatio, wordCount } = evaluation;

  const getScoreColor = () => {
    const percentage = (score / (question.maxScore + 1)) * 100;
    if (percentage >= 80) return 'text-emerald-600';
    if (percentage >= 50) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreBackground = () => {
    const percentage = (score / (question.maxScore + 1)) * 100;
    if (percentage >= 80) return 'bg-emerald-50 border-emerald-200';
    if (percentage >= 50) return 'bg-amber-50 border-amber-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-6 text-center">
            Answer Evaluation
          </h2>

          <div className={`border rounded-lg p-6 mb-6 ${getScoreBackground()}`}>
            <div className="text-center mb-4">
              <p className="text-sm text-slate-600 mb-2">Your Score</p>
              <p className={`text-6xl font-bold ${getScoreColor()}`}>
                {score}
              </p>
              <p className="text-sm text-slate-600 mt-2">
                out of {question.maxScore} points
              </p>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-slate-900">Performance Summary</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Keywords Matched:</span>
                  <span className="font-semibold text-slate-900">
                    {matchedKeywords.length} / {question.keywords.length} ({Math.round(keywordRatio * 100)}%)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Word Count:</span>
                  <span className="font-semibold text-slate-900">
                    {wordCount} words {wordCount > 20 && '(+1 bonus point)'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-3">Keyword Analysis</h3>
              <div className="space-y-2">
                {question.keywords.map((keyword, idx) => {
                  const matched = matchedKeywords.includes(keyword);
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-2 text-sm"
                    >
                      {matched ? (
                        <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                      )}
                      <span className={matched ? 'text-emerald-700 font-medium' : 'text-slate-500'}>
                        {keyword}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {matchedKeywords.length < question.keywords.length && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Tip:</strong> To improve your score, make sure to include all relevant keywords in your answer. Focus on technical terms and key concepts related to the question.
                </p>
              </div>
            )}
          </div>

          <button
            onClick={onNext}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Continue to Next Question
          </button>
        </div>
      </div>
    </div>
  );
}
