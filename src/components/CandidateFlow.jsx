import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import {
  createCandidate,
  updateCandidateStatus,
  submitAnswer,
  updateFinalScore,
  createSession,
  updateSession,
  deleteSession,
} from '../store/interviewSlice';
import {
  selectQuestions,
  evaluateAnswer,
  calculateFinalScore,
} from '../utils/evaluation';
import ResumeUpload from './ResumeUpload';
import InterviewInstructions from './InterviewInstructions';
import InterviewQuestion from './InterviewQuestion';
import QuestionFeedback from './QuestionFeedback';
import InterviewComplete from './InterviewComplete';

export default function CandidateFlow({ interviewCode, onNavigate }) {
  const dispatch = useDispatch();
  const questionSets = useSelector((state) => state.interview.questionSets);
  const sessions = useSelector((state) => state.interview.sessions);

  const [stage, setStage] = useState('resume');
  const [candidateId, setCandidateId] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [candidateInfo, setCandidateInfo] = useState(null);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentEvaluation, setCurrentEvaluation] = useState(null);
  const [allAnswers, setAllAnswers] = useState([]);

  const questionSet = questionSets[interviewCode];

  useEffect(() => {
    const existingSession = Object.values(sessions).find(
      (s) => s.candidateId === candidateId
    );

    if (existingSession && stage === 'resume') {
      setSessionId(existingSession.sessionId);
      setSelectedQuestions(existingSession.questions);
      setCurrentQuestionIndex(existingSession.currentQuestionIndex);
      setStage('question');
    }
  }, [candidateId, sessions]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (stage === 'question' && candidateId) {
        dispatch(updateCandidateStatus({ candidateId, status: 'abandoned' }));
        if (sessionId) {
          dispatch(deleteSession({ sessionId }));
        }
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && stage === 'question' && candidateId) {
        dispatch(updateCandidateStatus({ candidateId, status: 'abandoned' }));
        if (sessionId) {
          dispatch(deleteSession({ sessionId }));
        }
        onNavigate('home');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [stage, candidateId, sessionId, dispatch, onNavigate]);

  if (!questionSet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Invalid Interview Code
            </h2>
            <p className="text-slate-600 mb-6">
              The interview code you entered is not valid. Please check and try again.
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

  const handleResumeComplete = (info) => {
    const newCandidateId = uuidv4();
    setCandidateId(newCandidateId);
    setCandidateInfo(info);

    dispatch(
      createCandidate({
        id: newCandidateId,
        interviewCode,
        name: info.name,
        email: info.email,
        phone: info.phone,
      })
    );

    setStage('instructions');
  };

  const handleStartInterview = () => {
    const selected = selectQuestions(questionSet.questions);
    setSelectedQuestions(selected);

    const newSessionId = uuidv4();
    setSessionId(newSessionId);

    dispatch(
      createSession({
        sessionId: newSessionId,
        candidateId,
        questions: selected,
      })
    );

    setStage('question');
  };

  const handleAnswerSubmit = (answer) => {
    const currentQuestion = selectedQuestions[currentQuestionIndex];
    const evaluation = evaluateAnswer(
      answer,
      currentQuestion.keywords,
      currentQuestion.maxScore
    );

    dispatch(
      submitAnswer({
        candidateId,
        questionId: currentQuestion.id,
        answer,
        matchedKeywords: evaluation.matchedKeywords,
        score: evaluation.score,
      })
    );

    setCurrentEvaluation(evaluation);
    setAllAnswers([
      ...allAnswers,
      {
        questionId: currentQuestion.id,
        answer,
        score: evaluation.score,
      },
    ]);

    setStage('feedback');
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < selectedQuestions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);

      dispatch(
        updateSession({
          sessionId,
          updates: { currentQuestionIndex: nextIndex },
        })
      );

      setStage('question');
    } else {
      const finalScore = calculateFinalScore(
        [...allAnswers, {
          questionId: selectedQuestions[currentQuestionIndex].id,
          score: currentEvaluation.score,
        }],
        selectedQuestions
      );

      dispatch(updateFinalScore({ candidateId, score: finalScore }));
      dispatch(updateCandidateStatus({ candidateId, status: 'completed' }));
      dispatch(deleteSession({ sessionId }));

      setStage('complete');
    }
  };

  if (stage === 'resume') {
    return (
      <ResumeUpload
        onComplete={handleResumeComplete}
        interviewCode={interviewCode}
      />
    );
  }

  if (stage === 'instructions') {
    return (
      <InterviewInstructions
        onStart={handleStartInterview}
        questionCount={6}
      />
    );
  }

  if (stage === 'question') {
    return (
      <InterviewQuestion
        question={selectedQuestions[currentQuestionIndex]}
        questionNumber={currentQuestionIndex + 1}
        totalQuestions={selectedQuestions.length}
        timeLimit={120}
        onSubmit={handleAnswerSubmit}
        onTimeExpired={handleAnswerSubmit}
      />
    );
  }

  if (stage === 'feedback') {
    return (
      <QuestionFeedback
        evaluation={currentEvaluation}
        question={selectedQuestions[currentQuestionIndex]}
        onNext={handleNextQuestion}
      />
    );
  }

  if (stage === 'complete') {
    const finalScore = calculateFinalScore(allAnswers, selectedQuestions);
    return (
      <InterviewComplete
        finalScore={finalScore}
        candidateInfo={candidateInfo}
        totalQuestions={selectedQuestions.length}
      />
    );
  }

  return null;
}
