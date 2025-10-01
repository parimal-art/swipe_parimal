import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Users, TrendingUp, Clock, ArrowLeft, Eye } from 'lucide-react';

export default function InterviewerDashboard({ dashboardCode, onNavigate }) {
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const questionSets = useSelector((state) => state.interview.questionSets);
  const candidates = useSelector((state) => state.interview.candidates);

  const questionSet = Object.values(questionSets).find(
    (qs) => qs.dashboardCode === dashboardCode
  );

  if (!questionSet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Dashboard Not Found
            </h2>
            <p className="text-slate-600 mb-6">
              No question set found for this dashboard code.
            </p>
            <button
              onClick={() => onNavigate('home')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const interviewCandidates = Object.values(candidates).filter(
    (c) => c.interviewCode === questionSet.interviewCode
  );

  const stats = {
    total: interviewCandidates.length,
    completed: interviewCandidates.filter((c) => c.status === 'completed').length,
    inProgress: interviewCandidates.filter((c) => c.status === 'in_progress').length,
    avgScore:
      interviewCandidates.length > 0
        ? (
            interviewCandidates.reduce((sum, c) => sum + (c.finalScore || 0), 0) /
            interviewCandidates.length
          ).toFixed(1)
        : 0,
  };

  if (selectedCandidate) {
    const candidate = candidates[selectedCandidate];
    if (!candidate) return null;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={() => setSelectedCandidate(null)}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-2">
                  {candidate.name}
                </h2>
                <div className="space-y-1 text-slate-600">
                  <p>{candidate.email}</p>
                  <p>{candidate.phone}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500 mb-1">Final Score</p>
                <p className="text-5xl font-bold text-emerald-600">
                  {candidate.finalScore}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-4 text-sm">
                <span className={`px-3 py-1 rounded-full font-semibold ${
                  candidate.status === 'completed'
                    ? 'bg-emerald-100 text-emerald-700'
                    : candidate.status === 'in_progress'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {candidate.status.replace('_', ' ').toUpperCase()}
                </span>
                <span className="text-slate-500">
                  Started: {new Date(candidate.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xl font-bold text-slate-900">
                Question Responses ({candidate.answers.length})
              </h3>

              {candidate.answers.map((answer, idx) => {
                const question = questionSet.questions.find(
                  (q) => q.id === answer.questionId
                );
                if (!question) return null;

                return (
                  <div
                    key={idx}
                    className="bg-slate-50 rounded-lg p-6 border border-slate-200"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 text-xs font-semibold rounded ${
                            question.difficulty === 'easy'
                              ? 'bg-emerald-100 text-emerald-700'
                              : question.difficulty === 'medium'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {question.difficulty.toUpperCase()}
                          </span>
                          <span className="text-sm text-slate-500">
                            Question {idx + 1}
                          </span>
                        </div>
                        <p className="font-semibold text-slate-900 mb-2">
                          {question.question}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-3xl font-bold text-emerald-600">
                          {answer.score}
                        </p>
                        <p className="text-xs text-slate-500">
                          / {question.maxScore}
                        </p>
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className="text-sm font-medium text-slate-700 mb-2">
                        Candidate's Answer:
                      </p>
                      <div className="bg-white rounded p-4 text-slate-900 whitespace-pre-wrap">
                        {answer.answer || '(No answer provided)'}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-slate-700 mb-2">
                        Keyword Analysis:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {question.keywords.map((keyword, i) => (
                          <span
                            key={i}
                            className={`px-2 py-1 text-xs rounded ${
                              answer.matchedKeywords.includes(keyword)
                                ? 'bg-emerald-100 text-emerald-700 font-semibold'
                                : 'bg-slate-200 text-slate-500 line-through'
                            }`}
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-slate-500 mt-2">
                        Matched {answer.matchedKeywords.length} out of {question.keywords.length} keywords
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              Interviewer Dashboard
            </h2>
            <p className="text-slate-600">
              Interview Code: <span className="font-mono font-semibold">{questionSet.interviewCode}</span>
            </p>
          </div>
          <button
            onClick={() => onNavigate('home')}
            className="bg-slate-600 hover:bg-slate-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Back to Home
          </button>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-8 h-8 text-blue-600" />
              <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
            </div>
            <p className="text-sm text-slate-600">Total Candidates</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-8 h-8 text-emerald-600" />
              <p className="text-3xl font-bold text-slate-900">{stats.avgScore}</p>
            </div>
            <p className="text-sm text-slate-600">Average Score</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-8 h-8 text-emerald-600" />
              <p className="text-3xl font-bold text-slate-900">{stats.completed}</p>
            </div>
            <p className="text-sm text-slate-600">Completed</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-8 h-8 text-amber-600" />
              <p className="text-3xl font-bold text-slate-900">{stats.inProgress}</p>
            </div>
            <p className="text-sm text-slate-600">In Progress</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-xl font-bold text-slate-900 mb-6">
            Candidate List
          </h3>

          {interviewCandidates.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">
                No candidates have taken the interview yet.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                      Name
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                      Email
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                      Phone
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                      Score
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                      Date
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {interviewCandidates
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .map((candidate) => (
                      <tr
                        key={candidate.id}
                        className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                      >
                        <td className="py-3 px-4 text-sm text-slate-900 font-medium">
                          {candidate.name}
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600">
                          {candidate.email}
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600">
                          {candidate.phone}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 text-xs font-semibold rounded ${
                            candidate.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-700'
                              : candidate.status === 'in_progress'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {candidate.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm font-bold text-emerald-600">
                          {candidate.finalScore.toFixed(1)}
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600">
                          {new Date(candidate.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => setSelectedCandidate(candidate.id)}
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
