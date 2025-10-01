import { Trophy, Award, TrendingUp, CheckCircle2 } from 'lucide-react';

export default function InterviewComplete({ finalScore, candidateInfo, totalQuestions }) {
  const getScoreGrade = (score) => {
    if (score >= 9) return { grade: 'Excellent', color: 'text-emerald-600', bg: 'bg-emerald-50' };
    if (score >= 7) return { grade: 'Good', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (score >= 5) return { grade: 'Average', color: 'text-amber-600', bg: 'bg-amber-50' };
    return { grade: 'Needs Improvement', color: 'text-red-600', bg: 'bg-red-50' };
  };

  const scoreGrade = getScoreGrade(finalScore);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-full mb-4">
              <Trophy className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              Interview Completed!
            </h2>
            <p className="text-slate-600">
              Congratulations, {candidateInfo.name}
            </p>
          </div>

          <div className={`border-2 rounded-xl p-8 mb-6 ${scoreGrade.bg}`}>
            <div className="text-center">
              <p className="text-sm text-slate-600 mb-2">Final Score</p>
              <p className={`text-7xl font-bold ${scoreGrade.color} mb-2`}>
                {finalScore}
              </p>
              <p className={`text-xl font-semibold ${scoreGrade.color}`}>
                {scoreGrade.grade}
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="bg-slate-50 rounded-lg p-4 text-center">
              <CheckCircle2 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-slate-900">{totalQuestions}</p>
              <p className="text-sm text-slate-600">Questions Answered</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4 text-center">
              <TrendingUp className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-slate-900">
                {Math.round((finalScore / 11) * 100)}%
              </p>
              <p className="text-sm text-slate-600">Success Rate</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4 text-center">
              <Award className="w-8 h-8 text-amber-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-slate-900">{scoreGrade.grade}</p>
              <p className="text-sm text-slate-600">Performance</p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-blue-900 mb-3">
              What Happens Next?
            </h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>Your responses have been saved and submitted to the interviewer</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>The interviewer will review your detailed answers and scores</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>You will be contacted at {candidateInfo.email} regarding next steps</span>
              </li>
            </ul>
          </div>

          <div className="bg-slate-50 rounded-lg p-6">
            <h3 className="font-semibold text-slate-900 mb-3">
              Your Information
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Name:</span>
                <span className="font-medium text-slate-900">{candidateInfo.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Email:</span>
                <span className="font-medium text-slate-900">{candidateInfo.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Phone:</span>
                <span className="font-medium text-slate-900">{candidateInfo.phone}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-6 text-slate-500 text-sm">
          Thank you for taking the time to complete this interview.
        </div>
      </div>
    </div>
  );
}
