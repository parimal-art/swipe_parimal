import { Clock, AlertTriangle, CheckCircle2, BookOpen } from 'lucide-react';

export default function InterviewInstructions({ onStart, questionCount = 6 }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-6 text-center">
            Interview Instructions
          </h2>

          <div className="space-y-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">
                  Question Format
                </h3>
                <p className="text-slate-600">
                  You will be asked <strong>{questionCount} questions</strong> total: 2 easy, 2 medium, and 2 hard questions. Each question tests different aspects of your knowledge and skills.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">
                  Time Limit
                </h3>
                <p className="text-slate-600">
                  Each question has a timer. You must answer within the allotted time. If time expires, your answer will be automatically submitted (even if empty).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">
                  Scoring System
                </h3>
                <p className="text-slate-600">
                  Your answers are evaluated based on keyword matching and completeness. Longer, detailed answers (20+ words) may receive bonus points. Final score is weighted: Easy (1x), Medium (2x), Hard (3x).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">
                  Important Rules
                </h3>
                <ul className="text-slate-600 space-y-1 list-disc list-inside">
                  <li>Do not close or switch browser tabs during the interview</li>
                  <li>If you leave the interview screen, your session will be terminated</li>
                  <li>Once submitted, you cannot change your answer</li>
                  <li>Each question must be answered in sequence</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-blue-900 mb-2">
              Tips for Success
            </h3>
            <ul className="text-blue-800 space-y-2 text-sm">
              <li>Read each question carefully before answering</li>
              <li>Include relevant keywords and technical terms in your answers</li>
              <li>Provide detailed explanations when possible</li>
              <li>Manage your time wisely for each question</li>
              <li>Stay focused and avoid distractions</li>
            </ul>
          </div>

          <div className="flex gap-4">
            <button
              onClick={onStart}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors text-lg"
            >
              I Understand, Start Interview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
