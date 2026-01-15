
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ClipboardList, LayoutDashboard, CheckCircle } from 'lucide-react';

export default function HomePage() {

  const navigate = useNavigate();
  const [interviewCode, setInterviewCode] = useState('');
  const [dashboardCode, setDashboardCode] = useState('');

  const handleCandidateStart = (e) => {
    e.preventDefault();
    if (interviewCode.trim()) {
      navigate(`/interview/${interviewCode.toUpperCase()}`);
    }
  };

  const handleInterviewerAccess = (e) => {
    e.preventDefault();
    if (dashboardCode.trim()) {
      navigate(`/dashboard/${dashboardCode.toUpperCase()}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-slate-900 mb-4">
             SmartHire Interview Platform
          </h1>
          <p className="text-xl text-slate-600">
            Streamline your interview process with intelligent assessments
          </p>
        </div>

        <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          
          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow flex flex-col">
            <div className="flex-grow">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">
                For Candidates
              </h2>
              <p className="text-slate-600 mb-6">
                Enter your interview code to begin your assessment.
              </p>
              <form onSubmit={handleCandidateStart} id="candidate-form" className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Interview Code
                  </label>
                  <input
                    type="text"
                    value={interviewCode}
                    onChange={(e) => setInterviewCode(e.target.value)}
                    placeholder="e.g., ABC123"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                    required
                  />
                </div>
              </form>
            </div>
            <button
              type="submit"
              form="candidate-form"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors mt-6"
            >
              Start Interview
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow flex flex-col">
            <div className="flex-grow">
              <div className="flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-6">
                <ClipboardList className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">
                Create an Interview
              </h2>
              <p className="text-slate-600 mb-6">
                Build a new set of questions for candidates.
              </p>
              <div className="text-sm text-slate-600 space-y-3">
                  <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>Define questions with varying difficulty levels.</span>
                  </div>
                  <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>Provide keywords for automated scoring.</span>
                  </div>
                  <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>Option to bulk upload questions using a CSV file.</span>
                  </div>
              </div>
            </div>
            <button
              onClick={() => navigate('/create-questions')}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors mt-6"
            >
              Create Question Set
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow flex flex-col">
            <div className="flex-grow">
              <div className="flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-6">
                <LayoutDashboard className="w-8 h-8 text-slate-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">
                View Dashboard
              </h2>
              <p className="text-slate-600 mb-6">
                Access existing results and candidate insights.
              </p>
              <form onSubmit={handleInterviewerAccess} id="dashboard-form" className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Dashboard Code
                  </label>
                  <input
                    type="text"
                    value={dashboardCode}
                    onChange={(e) => setDashboardCode(e.target.value)}
                    placeholder="Enter dashboard code"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent uppercase"
                  />
                </div>
              </form>
            </div>
            <button
              type="submit"
              form="dashboard-form"
              className="w-full bg-slate-600 hover:bg-slate-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors mt-6"
            >
              Access Dashboard
            </button>
          </div>
        </div>

        <div className="mt-16 max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-8">
            <h3 className="text-xl font-bold text-slate-900 mb-4">
              How It Works
            </h3>
            <div className="space-y-4 text-slate-600">
              <div className="flex items-start">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold mr-3">
                  1
                </span>
                <p>
                  <strong>Interviewers</strong> create question sets with easy, medium, and hard questions.
                </p>
              </div>
              <div className="flex items-start">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold mr-3">
                  2
                </span>
                <p>
                  Share the interview code with candidates.
                </p>
              </div>
              <div className="flex items-start">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold mr-3">
                  3
                </span>
                <p>
                  <strong>Candidates</strong> upload their resume and answer 6 questions (2 easy, 2 medium, 2 hard).
                </p>
              </div>
              <div className="flex items-start">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold mr-3">
                  4
                </span>
                <p>
                  Answers are evaluated using AI-powered keyword matching and scoring.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}