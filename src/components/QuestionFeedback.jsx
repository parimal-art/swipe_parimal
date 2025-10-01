

export default function QuestionFeedback({ evaluation, question, onNext }) {

  const { score } = evaluation;

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">
            Answer Evaluation
          </h2>

          <div className={`border rounded-lg p-8 mb-8 ${getScoreBackground()}`}>
            <p className="text-sm text-slate-600 mb-2">Your Score</p>
            <p className={`text-7xl font-bold ${getScoreColor()}`}>
              {score}
            </p>
            <p className="text-sm text-slate-600 mt-2">
              out of {question.maxScore} points
            </p>
          </div>
          
          <p className="text-slate-600 mb-8">
            Your response has been saved. Click the button below to proceed.
          </p>
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