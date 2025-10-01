// src/components/CreateQuestions.jsx

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Plus, Trash2, Upload, CheckCircle, AlertCircle, ListChecks } from 'lucide-react';
import Papa from 'papaparse';
import { v4 as uuidv4 } from 'uuid';
import { createQuestionSet } from '../store/interviewSlice';
import { generateCode } from '../utils/evaluation';

export default function CreateQuestions({ onNavigate }) {
  const dispatch = useDispatch();
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState({
    difficulty: 'easy',
    question: '',
    keywords: '',
    maxScore: 10,
  });
  const [codes, setCodes] = useState(null);
  const [error, setError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');

  const addQuestion = () => {
    if (!newQuestion.question.trim() || !newQuestion.keywords.trim()) {
      setError('Please fill in all question fields');
      setUploadSuccess('');
      return;
    }

    const keywords = newQuestion.keywords
      .split(';')
      .map(k => k.trim())
      .filter(k => k.length > 0);

    if (keywords.length === 0) {
      setError('Please add at least one keyword (separated by semicolons)');
      setUploadSuccess('');
      return;
    }

    setQuestions([
      ...questions,
      {
        id: uuidv4(),
        difficulty: newQuestion.difficulty,
        question: newQuestion.question,
        keywords,
        maxScore: parseInt(newQuestion.maxScore) || 10,
      },
    ]);

    setNewQuestion({
      difficulty: 'easy',
      question: '',
      keywords: '',
      maxScore: 10,
    });
    setError('');
    setUploadSuccess('');
  };

  const removeQuestion = (id) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsed = results.data.map(row => ({
          id: uuidv4(),
          difficulty: (row.difficulty || 'easy').toLowerCase(),
          question: row.question || '',
          keywords: row.keywords?.split(';').map(k => k.trim()).filter(k => k) || [],
          maxScore: row.maxScore ? parseInt(row.maxScore, 10) : 10,
        })).filter(q => q.question && q.keywords.length > 0);

        if (parsed.length === 0) {
          setError('No valid questions found in CSV. Make sure columns are named: difficulty, question, keywords.');
          setUploadSuccess('');
        } else {
          setQuestions(prev => [...prev, ...parsed]);
          setError('');
          setUploadSuccess(`Successfully added ${parsed.length} questions from CSV.`);
        }
      },
      error: (error) => {
        setError(`Error parsing CSV: ${error.message}`);
        setUploadSuccess('');
      },
    });

    e.target.value = '';
  };

  const validateAndSubmit = () => {
    const easyCount = questions.filter(q => q.difficulty === 'easy').length;
    const mediumCount = questions.filter(q => q.difficulty === 'medium').length;
    const hardCount = questions.filter(q => q.difficulty === 'hard').length;

    if (easyCount < 2 || mediumCount < 2 || hardCount < 2) {
      setError('You must add at least 2 easy, 2 medium, and 2 hard questions.');
      return;
    }

    const interviewCode = generateCode(6);
    const dashboardCode = generateCode(8);

    dispatch(
      createQuestionSet({
        interviewCode,
        dashboardCode,
        questions,
      })
    );

    setCodes({ interviewCode, dashboardCode });
    setError('');
    setUploadSuccess('');
  };

  if (codes) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex justify-center mb-6">
              <CheckCircle className="w-16 h-16 text-emerald-500" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 text-center mb-6">
              Question Set Created Successfully
            </h2>

            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-semibold text-slate-900 mb-2">
                  Interview Code for Candidates
                </h3>
                <p className="text-3xl font-bold text-blue-600 tracking-wider text-center py-4">
                  {codes.interviewCode}
                </p>
                <p className="text-sm text-slate-600 text-center">
                  Share this code with candidates to begin their interview
                </p>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
                <h3 className="font-semibold text-slate-900 mb-2">
                  Dashboard Code for You
                </h3>
                <p className="text-3xl font-bold text-emerald-600 tracking-wider text-center py-4">
                  {codes.dashboardCode}
                </p>
                <p className="text-sm text-slate-600 text-center">
                  Use this code to access your interviewer dashboard
                </p>
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <button
                onClick={() => onNavigate('dashboard', { dashboardCode: codes.dashboardCode })}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => onNavigate('home')}
                className="flex-1 bg-slate-600 hover:bg-slate-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">
            Create Question Set
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">

            {/* Left Column: Forms */}
            <div className="lg:col-span-3">
              <div className="mb-8">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Upload CSV (Optional)
                </label>
                <div className="flex items-center gap-4">
                  <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" id="csv-upload" />
                  <label htmlFor="csv-upload" className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2 px-4 rounded-lg cursor-pointer transition-colors">
                    <Upload className="w-4 h-4" />
                    Upload CSV
                  </label>
                  <span className="text-sm text-slate-500">
                    Format: difficulty, question, keywords
                  </span>
                </div>
              </div>

              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {uploadSuccess && (
                <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{uploadSuccess}</span>
                </div>
              )}

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Add Question Manually</h3>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Difficulty</label>
                    <select value={newQuestion.difficulty} onChange={(e) => setNewQuestion({ ...newQuestion, difficulty: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Max Score</label>
                    <input type="number" value={newQuestion.maxScore} onChange={(e) => setNewQuestion({ ...newQuestion, maxScore: e.target.value })} min="1" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Question</label>
                  <textarea value={newQuestion.question} onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })} placeholder="Enter your question here..." rows="3" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Keywords (separated by semicolons)</label>
                  <input type="text" value={newQuestion.keywords} onChange={(e) => setNewQuestion({ ...newQuestion, keywords: e.target.value })} placeholder="keyword1;keyword2;keyword3" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                </div>
                <button onClick={addQuestion} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                  <Plus className="w-4 h-4" />
                  Add Question
                </button>
              </div>
            </div>

            {/* Right Column: Question List */}
            <div className="lg:col-span-2">
              <div className="bg-slate-50 rounded-lg p-6 sticky top-8">
                <h3 className="font-semibold text-slate-900 mb-4">Your Questions ({questions.length})</h3>
                <div className="space-y-2 mb-4">
                  {['easy', 'medium', 'hard'].map(diff => {
                    const count = questions.filter(q => q.difficulty === diff).length;
                    const color = diff === 'easy' ? 'text-emerald-600' : diff === 'medium' ? 'text-amber-600' : 'text-red-600';
                    return (
                      <div key={diff} className="text-sm flex justify-between items-center">
                        <span className="capitalize font-medium">{diff}:</span>
                        <span className={`font-semibold ${color}`}>
                          {count} {count >= 2 ? <CheckCircle className="inline w-4 h-4 ml-1"/> : `(minimum 2 required)`}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {questions.length > 0 ? (
                  <div className="border-t border-slate-200 pt-4 mt-4 space-y-2 max-h-[55vh] overflow-y-auto pr-2">
                    {questions.map((q) => (
                      <div key={q.id} className="bg-white border border-slate-200 rounded-lg p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`px-2 py-1 text-xs font-semibold rounded ${q.difficulty === 'easy' ? 'bg-emerald-100 text-emerald-700' : q.difficulty === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                                {q.difficulty.toUpperCase()}
                              </span>
                              <span className="text-sm text-slate-500">Max Score: {q.maxScore}</span>
                            </div>
                            <p className="text-slate-900 mb-2 font-medium">{q.question}</p>
                            <div className="flex flex-wrap gap-1">
                              {q.keywords.map((keyword, i) => (
                                <span key={i} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded">{keyword}</span>
                              ))}
                            </div>
                          </div>
                          <button onClick={() => removeQuestion(q.id)} className="text-red-500 hover:text-red-700 transition-colors flex-shrink-0">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 border-2 border-dashed rounded-lg mt-4">
                    <ListChecks className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">Questions you add will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Buttons */}
          <div className="flex gap-4 border-t border-slate-200 pt-6 mt-8">
            <button onClick={validateAndSubmit} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50" disabled={questions.length === 0}>
              Create Question Set
            </button>
            <button onClick={() => onNavigate('home')} className="bg-slate-300 hover:bg-slate-400 text-slate-700 font-semibold py-3 px-6 rounded-lg transition-colors">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}