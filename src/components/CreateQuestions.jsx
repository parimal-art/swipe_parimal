import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Trash2, CheckCircle, AlertCircle, ListChecks,
  Loader2, Sparkles, Edit2, Save, X, ChevronDown, ChevronUp
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { createQuestionSetInDB, generateQuestionsWithAI } from '../store/interviewSlice';
import { generateCode } from '../utils/evaluation';

const countWords = (text) => text.trim().split(/\s+/).filter(Boolean).length;

// ─── AI Generate Panel ────────────────────────────────────────────────────────
function AIGeneratePanel({ onQuestionsGenerated }) {
  const dispatch = useDispatch();
  const { aiStatus, aiError } = useSelector((state) => state.interview);

  const [aiForm, setAiForm] = useState({
    topic: '',
    difficulty: 'easy',
    questionType: 'long',
    count: 2,
    maxScore: 10,
  });
  const [localError, setLocalError] = useState('');
  const [isOpen, setIsOpen] = useState(true);

  const handleGenerate = async () => {
    setLocalError('');
    if (!aiForm.topic.trim()) {
      setLocalError('Please enter a topic.');
      return;
    }
    try {
      const result = await dispatch(generateQuestionsWithAI(aiForm)).unwrap();
      // Attach IDs to each question
      const withIds = result.map((q) => ({
        ...q,
        id: uuidv4(),
        maxScore: parseInt(aiForm.maxScore, 10) || 10,
        questionType: aiForm.questionType,
        difficulty: aiForm.difficulty,
      }));
      onQuestionsGenerated(withIds);
    } catch (err) {
      setLocalError(err || 'AI generation failed. Please try again.');
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-5 mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h3 className="font-bold text-purple-900 text-lg">AI Question Generator</h3>
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5 text-purple-600" /> : <ChevronDown className="w-5 h-5 text-purple-600" />}
      </button>

      {isOpen && (
        <div className="mt-4">
          {(localError || aiError) && (
            <div className="mb-3 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg flex items-start gap-2 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{localError || aiError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-purple-800 mb-1">Topic / Subject *</label>
              <input
                type="text"
                value={aiForm.topic}
                onChange={(e) => setAiForm({ ...aiForm, topic: e.target.value })}
                placeholder="e.g. React Hooks, JWT Authentication, SQL Joins"
                className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-purple-800 mb-1">Difficulty</label>
              <select
                value={aiForm.difficulty}
                onChange={(e) => setAiForm({ ...aiForm, difficulty: e.target.value })}
                className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-purple-800 mb-1">Question Type</label>
              <select
                value={aiForm.questionType}
                onChange={(e) => setAiForm({ ...aiForm, questionType: e.target.value })}
                className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
              >
                <option value="long">Long Answer</option>
                <option value="mcq">MCQ (Multiple Choice)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-purple-800 mb-1">Number of Questions</label>
              <input
                type="number"
                value={aiForm.count}
                onChange={(e) => setAiForm({ ...aiForm, count: Math.max(1, Math.min(5, parseInt(e.target.value) || 1)) })}
                min="1"
                max="5"
                className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-purple-800 mb-1">Max Score</label>
              <input
                type="number"
                value={aiForm.maxScore}
                onChange={(e) => setAiForm({ ...aiForm, maxScore: parseInt(e.target.value) || 10 })}
                min="1"
                className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
              />
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={aiStatus === 'loading'}
            className="mt-4 flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-semibold py-2.5 px-5 rounded-lg transition-colors"
          >
            {aiStatus === 'loading' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Questions
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Edit Question Modal ──────────────────────────────────────────────────────
function EditQuestionModal({ question, onSave, onClose }) {
  const [form, setForm] = useState({
    ...question,
    keywords: question.keywords?.join(';') || '',
    options: question.options || ['', '', '', ''],
  });

  const handleSave = () => {
    const keywords = form.keywords
      .split(';')
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    if (!form.question.trim()) return;

    const updated = {
      ...question,
      ...form,
      keywords,
      maxScore: parseInt(form.maxScore, 10) || 10,
      options: form.questionType === 'mcq' ? form.options.filter((o) => o.trim()) : [],
    };
    onSave(updated);
  };

  const updateOption = (index, value) => {
    const newOptions = [...form.options];
    newOptions[index] = value;
    setForm({ ...form, options: newOptions });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h3 className="text-xl font-bold text-slate-900">Edit Question</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Difficulty</label>
              <select
                value={form.difficulty}
                onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Max Score</label>
              <input
                type="number"
                value={form.maxScore}
                onChange={(e) => setForm({ ...form, maxScore: e.target.value })}
                min="1"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Question Type</label>
            <select
              value={form.questionType || 'long'}
              onChange={(e) => setForm({ ...form, questionType: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            >
              <option value="long">Long Answer</option>
              <option value="mcq">MCQ</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Question Text</label>
            <textarea
              value={form.question}
              onChange={(e) => setForm({ ...form, question: e.target.value })}
              rows="3"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {(form.questionType || 'long') === 'mcq' && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Options (4)</label>
                <div className="space-y-2">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-500 w-6">
                        {['A', 'B', 'C', 'D'][i]}.
                      </span>
                      <input
                        type="text"
                        value={form.options[i] || ''}
                        onChange={(e) => updateOption(i, e.target.value)}
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                        placeholder={`Option ${['A', 'B', 'C', 'D'][i]}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Correct Answer</label>
                <select
                  value={form.correctAnswer || ''}
                  onChange={(e) => setForm({ ...form, correctAnswer: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select correct answer</option>
                  {form.options.filter((o) => o.trim()).map((opt, i) => (
                    <option key={i} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Explanation (optional)</label>
                <textarea
                  value={form.explanation || ''}
                  onChange={(e) => setForm({ ...form, explanation: e.target.value })}
                  rows="2"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Keywords (semicolon separated) — used for long-answer scoring
            </label>
            <input
              type="text"
              value={form.keywords}
              onChange={(e) => setForm({ ...form, keywords: e.target.value })}
              placeholder="keyword1;keyword2;keyword3"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t border-slate-200">
          <button
            onClick={handleSave}
            className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold py-2.5 px-4 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Question Card ────────────────────────────────────────────────────────────
function QuestionCard({ question, onEdit, onRemove }) {
  const diffColors = {
    easy: 'bg-emerald-100 text-emerald-700',
    medium: 'bg-amber-100 text-amber-700',
    hard: 'bg-red-100 text-red-700',
  };
  const isAI = question.aiGenerated;
  const isMCQ = (question.questionType || 'long') === 'mcq';

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={`px-2 py-0.5 text-xs font-semibold rounded ${diffColors[question.difficulty] || diffColors.easy}`}>
              {question.difficulty?.toUpperCase()}
            </span>
            <span className={`px-2 py-0.5 text-xs font-semibold rounded ${isMCQ ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>
              {isMCQ ? 'MCQ' : 'Long Answer'}
            </span>
            {isAI && (
              <span className="px-2 py-0.5 text-xs font-semibold rounded bg-purple-100 text-purple-700 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> AI
              </span>
            )}
            <span className="text-xs text-slate-500">Score: {question.maxScore}</span>
          </div>
          <p className="text-slate-900 font-medium mb-2 leading-snug">{question.question}</p>
          {isMCQ && question.options?.length > 0 && (
            <div className="grid grid-cols-2 gap-1 mb-2">
              {question.options.map((opt, i) => (
                <div
                  key={i}
                  className={`text-xs px-2 py-1 rounded ${opt === question.correctAnswer ? 'bg-emerald-100 text-emerald-700 font-semibold' : 'bg-slate-50 text-slate-600'}`}
                >
                  {['A', 'B', 'C', 'D'][i]}. {opt}
                </div>
              ))}
            </div>
          )}
          {question.keywords?.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {question.keywords.map((kw, i) => (
                <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded">{kw}</span>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1 flex-shrink-0">
          <button
            onClick={() => onEdit(question)}
            className="text-blue-500 hover:text-blue-700 transition-colors p-1"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onRemove(question.id)}
            className="text-red-400 hover:text-red-600 transition-colors p-1"
            title="Remove"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CreateQuestions() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { status, error: reduxError } = useSelector((state) => state.interview);

  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState({
    difficulty: 'easy',
    questionType: 'long',
    question: '',
    keywords: '',
    maxScore: 10,
    options: ['', '', '', ''],
    correctAnswer: '',
    explanation: '',
  });
  const [codes, setCodes] = useState(null);
  const [error, setError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [activeTab, setActiveTab] = useState('ai');

  // AI generated questions added to list
  const handleAIQuestionsGenerated = (aiQuestions) => {
    setQuestions((prev) => [...prev, ...aiQuestions]);
    setUploadSuccess(`✓ ${aiQuestions.length} questions added by AI!`);
    setError('');
    setTimeout(() => setUploadSuccess(''), 4000);
  };

  // Manual add
  const addQuestion = () => {
    const isMCQ = newQuestion.questionType === 'mcq';

    if (!newQuestion.question.trim()) {
      setError('Question text required.');
      return;
    }

    if (isMCQ) {
      const filledOptions = newQuestion.options.filter((o) => o.trim());
      if (filledOptions.length < 2) {
        setError('At least 2 options required for MCQ.');
        return;
      }
      if (!newQuestion.correctAnswer.trim()) {
        setError('Please select the correct answer for MCQ.');
        return;
      }
    } else {
      if (countWords(newQuestion.question) > 12) {
        setError('Long-answer question must be 12 words or fewer.');
        return;
      }
      if (!newQuestion.keywords.trim()) {
        setError('Keywords required for long-answer questions.');
        return;
      }
    }

    const keywords = newQuestion.keywords
      .split(';')
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    setQuestions([
      ...questions,
      {
        id: uuidv4(),
        difficulty: newQuestion.difficulty,
        questionType: newQuestion.questionType,
        question: newQuestion.question,
        keywords,
        maxScore: parseInt(newQuestion.maxScore, 10) || 10,
        options: isMCQ ? newQuestion.options.filter((o) => o.trim()) : [],
        correctAnswer: isMCQ ? newQuestion.correctAnswer : '',
        explanation: isMCQ ? newQuestion.explanation : '',
        aiGenerated: false,
      },
    ]);

    setNewQuestion({
      difficulty: 'easy',
      questionType: 'long',
      question: '',
      keywords: '',
      maxScore: 10,
      options: ['', '', '', ''],
      correctAnswer: '',
      explanation: '',
    });
    setError('');
    setUploadSuccess('Question added!');
    setTimeout(() => setUploadSuccess(''), 3000);
  };

  const removeQuestion = (id) => setQuestions(questions.filter((q) => q.id !== id));

  const handleEditSave = (updated) => {
    setQuestions(questions.map((q) => (q.id === updated.id ? updated : q)));
    setEditingQuestion(null);
  };

  const validateAndSubmit = async () => {
    setError('');
    const longQuestions = questions.filter((q) => (q.questionType || 'long') === 'long');
    const easy = longQuestions.filter((q) => q.difficulty === 'easy').length;
    const medium = longQuestions.filter((q) => q.difficulty === 'medium').length;
    const hard = longQuestions.filter((q) => q.difficulty === 'hard').length;
    if (easy < 2 || medium < 2 || hard < 2) {
      setError('Add at least 2 easy, 2 medium, and 2 hard long-answer questions. MCQs are asked before these 6 long questions.');
      return;
    }
    const longQuestionTooLong = longQuestions.find((q) => countWords(q.question) > 12);
    if (longQuestionTooLong) {
      setError('Every long-answer question must be 12 words or fewer.');
      return;
    }
    const interviewCode = generateCode(6);
    const dashboardCode = generateCode(8);
    try {
      await dispatch(createQuestionSetInDB({ interviewCode, dashboardCode, questions })).unwrap();
      setCodes({ interviewCode, dashboardCode });
    } catch {
      setError(reduxError || 'Error saving. Please try again.');
    }
  };

  // ── Success Screen ──
  if (codes) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex justify-center mb-6">
              <CheckCircle className="w-16 h-16 text-emerald-500" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 text-center mb-6">
              Assessment Created!
            </h2>
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-semibold text-slate-900 mb-2">Assessment Code (for Candidates)</h3>
                <p className="text-3xl font-bold text-blue-600 tracking-wider text-center py-4">{codes.interviewCode}</p>
                <p className="text-sm text-slate-600 text-center">Share this code with candidates</p>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
                <h3 className="font-semibold text-slate-900 mb-2">Dashboard Code (for You)</h3>
                <p className="text-3xl font-bold text-emerald-600 tracking-wider text-center py-4">{codes.dashboardCode}</p>
                <p className="text-sm text-slate-600 text-center">Use this to access your assessment dashboard</p>
              </div>
            </div>
            <div className="mt-8 flex gap-4">
              <button
                onClick={() => navigate(`/dashboard/${codes.dashboardCode}`)}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => navigate('/')}
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

  // ── Main Form ──
  const isMCQMode = newQuestion.questionType === 'mcq';
  const mcqCount = questions.filter((q) => q.questionType === 'mcq').length;
  const longQuestions = questions.filter((q) => (q.questionType || 'long') === 'long');

  return (
    <>
      {editingQuestion && (
        <EditQuestionModal
          question={editingQuestion}
          onSave={handleEditSave}
          onClose={() => setEditingQuestion(null)}
        />
      )}

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Create Assessment</h2>
            <p className="text-slate-500 mb-8">
              Use AI to generate questions automatically, or add them manually.
            </p>

            {error && (
              <div className="mb-5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            {uploadSuccess && (
              <div className="mb-5 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg flex items-start gap-2">
                <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{uploadSuccess}</span>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
              {/* Left Panel */}
              <div className="lg:col-span-3">
                {/* Tab Switcher */}
                <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-6">
                  {[
                    { id: 'ai', label: '✨ AI Generate', icon: Sparkles },
                    { id: 'manual', label: '✏️ Manual', icon: Plus },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-colors ${
                        activeTab === tab.id
                          ? 'bg-white text-slate-900 shadow'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* AI Tab */}
                {activeTab === 'ai' && (
                  <AIGeneratePanel onQuestionsGenerated={handleAIQuestionsGenerated} />
                )}

                {/* Manual Tab */}
                {activeTab === 'manual' && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                    <h3 className="font-semibold text-slate-900 mb-4">Add Question Manually</h3>
                    <div className="grid md:grid-cols-3 gap-3 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Difficulty</label>
                        <select
                          value={newQuestion.difficulty}
                          onChange={(e) => setNewQuestion({ ...newQuestion, difficulty: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                        >
                          <option value="easy">Easy</option>
                          <option value="medium">Medium</option>
                          <option value="hard">Hard</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                        <select
                          value={newQuestion.questionType}
                          onChange={(e) => setNewQuestion({ ...newQuestion, questionType: e.target.value, correctAnswer: '', options: ['', '', '', ''] })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                        >
                          <option value="long">Long Answer</option>
                          <option value="mcq">MCQ</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Max Score</label>
                        <input
                          type="number"
                          value={newQuestion.maxScore}
                          onChange={(e) => setNewQuestion({ ...newQuestion, maxScore: e.target.value })}
                          min="1"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Question</label>
                      <textarea
                        value={newQuestion.question}
                        onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                        placeholder="Enter your question..."
                        rows="3"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    {isMCQMode ? (
                      <>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-slate-700 mb-2">Options</label>
                          <div className="space-y-2">
                            {[0, 1, 2, 3].map((i) => (
                              <div key={i} className="flex items-center gap-2">
                                <span className="text-sm text-slate-500 font-medium w-5">{['A', 'B', 'C', 'D'][i]}.</span>
                                <input
                                  type="text"
                                  value={newQuestion.options[i]}
                                  onChange={(e) => {
                                    const opts = [...newQuestion.options];
                                    opts[i] = e.target.value;
                                    setNewQuestion({ ...newQuestion, options: opts });
                                  }}
                                  placeholder={`Option ${['A', 'B', 'C', 'D'][i]}`}
                                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-slate-700 mb-1">Correct Answer</label>
                          <select
                            value={newQuestion.correctAnswer}
                            onChange={(e) => setNewQuestion({ ...newQuestion, correctAnswer: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                          >
                            <option value="">Select correct answer</option>
                            {newQuestion.options.filter((o) => o.trim()).map((opt, i) => (
                              <option key={i} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-slate-700 mb-1">Explanation (optional)</label>
                          <input
                            type="text"
                            value={newQuestion.explanation}
                            onChange={(e) => setNewQuestion({ ...newQuestion, explanation: e.target.value })}
                            placeholder="Why is this the correct answer?"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                      </>
                    ) : (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Keywords (semicolon separated)
                        </label>
                        <input
                          type="text"
                          value={newQuestion.keywords}
                          onChange={(e) => setNewQuestion({ ...newQuestion, keywords: e.target.value })}
                          placeholder="keyword1;keyword2;keyword3"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    )}

                    <button
                      onClick={addQuestion}
                      className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-5 rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add Question
                    </button>
                  </div>
                )}

              </div>

              {/* Right Panel — Question List */}
              <div className="lg:col-span-2">
                <div className="bg-slate-50 rounded-xl p-5 sticky top-8">
                  <h3 className="font-bold text-slate-900 mb-3">
                    Questions Added ({questions.length})
                  </h3>

                  {/* Count per difficulty */}
                  <div className="space-y-1 mb-4">
                    <div className="text-sm flex justify-between items-center">
                      <span className="font-medium">MCQs first:</span>
                      <span className="font-semibold text-blue-600">{mcqCount}</span>
                    </div>
                    {['easy', 'medium', 'hard'].map((diff) => {
                      const count = longQuestions.filter((q) => q.difficulty === diff).length;
                      const color =
                        diff === 'easy' ? 'text-emerald-600' : diff === 'medium' ? 'text-amber-600' : 'text-red-600';
                      return (
                        <div key={diff} className="text-sm flex justify-between items-center">
                          <span className="capitalize font-medium">{diff} long:</span>
                          <span className={`font-semibold ${color} flex items-center gap-1`}>
                            {count}
                            {count >= 2 ? (
                              <CheckCircle className="inline w-4 h-4 ml-1" />
                            ) : (
                              <span className="text-slate-400 font-normal">(min 2)</span>
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {questions.length > 0 ? (
                    <div className="border-t border-slate-200 pt-4 space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                      {questions.map((q) => (
                        <QuestionCard
                          key={q.id}
                          question={q}
                          onEdit={setEditingQuestion}
                          onRemove={removeQuestion}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-14 border-2 border-dashed rounded-xl mt-4">
                      <ListChecks className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-400 text-sm">Questions will appear here</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-4 border-t border-slate-200 pt-6 mt-8">
              <button
                onClick={validateAndSubmit}
                disabled={questions.length === 0 || status === 'loading'}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Assessment'
                )}
              </button>
              <button
                onClick={() => navigate('/')}
                className="bg-slate-300 hover:bg-slate-400 text-slate-700 font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
