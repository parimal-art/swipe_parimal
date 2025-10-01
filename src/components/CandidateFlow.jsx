import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
// Import all the new async thunks
import {
  fetchQuestionSetByCode,
  createCandidateInDB,
  submitAnswerInDB,
  updateCandidateOnCompletion,
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
import { Loader2, AlertCircle } from 'lucide-react'; // For loading/error UI

export default function CandidateFlow({ interviewCode, onNavigate }) {
  const dispatch = useDispatch();
  
  // Get entire state objects to access status and error
  const { questionSets, sessions, candidates, status, error } = useSelector((state) => state.interview);

  const [stage, setStage] = useState('resume');
  const [candidateId, setCandidateId] = useState(null); // This will be the ID from the database
  const [sessionId, setSessionId] = useState(null);
  const [candidateInfo, setCandidateInfo] = useState(null);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentEvaluation, setCurrentEvaluation] = useState(null);
  const [allAnswers, setAllAnswers] = useState([]);

  // The selector now might not have the data initially, we fetch it in useEffect
  const questionSet = questionSets[interviewCode.toUpperCase()];
  const candidate = candidates[candidateId];

  // *** MAJOR CHANGE: Fetch question set from DB when component loads ***
  useEffect(() => {
    if (interviewCode) {
      // Fetch the data only if it's not already in the state
      if (!questionSet) {
        dispatch(fetchQuestionSetByCode(interviewCode));
      }
    }
  }, [interviewCode, questionSet, dispatch]);

  // This useEffect for handling page visibility/unload remains mostly the same,
  // but the dispatched actions should eventually become async thunks as well.
  useEffect(() => {
    const handleBeforeUnload = () => {
      // TODO: Create and dispatch an async thunk to update status in the DB
      // if (stage === 'question' && candidateId) {
      //   dispatch(updateCandidateStatusInDB({ candidateId, status: 'abandoned' }));
      // }
    };

    const handleVisibilityChange = () => {
      // TODO: Dispatch async thunk here as well
      // if (document.hidden && stage === 'question' && candidateId) {
      //   dispatch(updateCandidateStatusInDB({ candidateId, status: 'abandoned' }));
      //   onNavigate('home');
      // }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [stage, candidateId, dispatch, onNavigate]);

  // *** MAJOR CHANGE: New loading and error states UI ***
  if (status === 'loading' && !questionSet) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                <p className="text-slate-600">Verifying Interview Code...</p>
            </div>
        </div>
    );
  }

  if ((status === 'failed' && !questionSet) || (status === 'succeeded' && !questionSet)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Invalid Interview Code
            </h2>
            <p className="text-slate-600 mb-6">
              {error || 'The interview code you entered is not valid. Please check and try again.'}
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
  
  // If we have a questionSet but no selectedQuestions yet, it means loading is done
  // but the interview hasn't started. This prevents rendering other stages prematurely.
  if (!questionSet) return null;

  // *** MAJOR CHANGE: handleResumeComplete now saves candidate to DB ***
  const handleResumeComplete = async (info) => {
    setCandidateInfo(info);
    try {
      const resultAction = await dispatch(
        createCandidateInDB({
          interviewCode: interviewCode.toUpperCase(),
          name: info.name,
          email: info.email,
          phone: info.phone,
        })
      );
      const newCandidate = resultAction.payload;
      setCandidateId(newCandidate.id); // Set the ID received from the DB
      setStage('instructions');
    } catch (err) {
      console.error('Failed to create candidate:', err);
      // Optionally set an error state to show in the UI
    }
  };

  // This function can remain as is, it only prepares client-side state
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
  
  // *** MAJOR CHANGE: handleAnswerSubmit now saves answer to DB ***
  const handleAnswerSubmit = async (answer) => {
    const currentQuestion = selectedQuestions[currentQuestionIndex];
    const evaluation = evaluateAnswer(
      answer,
      currentQuestion.keywords,
      currentQuestion.maxScore
    );

    try {
      await dispatch(
        submitAnswerInDB({
          candidateId,
          questionId: currentQuestion.id,
          answer,
          matchedKeywords: evaluation.matchedKeywords,
          score: evaluation.score,
        })
      ).unwrap();

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

    } catch(err) {
      console.error("Failed to submit answer:", err);
      // Optionally show an error to the user
    }
  };
  
  // *** MAJOR CHANGE: handleNextQuestion now updates final score in DB ***
  const handleNextQuestion = async () => {
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
      // Calculate final score before dispatching
      const finalAnswers = [
          ...allAnswers,
          {
              questionId: selectedQuestions[currentQuestionIndex].id,
              score: currentEvaluation.score,
          },
      ];
      const finalScore = calculateFinalScore(finalAnswers, selectedQuestions);

      try {
        await dispatch(
          updateCandidateOnCompletion({ candidateId, score: finalScore })
        ).unwrap();
        
        dispatch(deleteSession({ sessionId }));
        setStage('complete');

      } catch (err) {
        console.error("Failed to update final score:", err);
      }
    }
  };

  // The rendering logic for different stages remains the same
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
    // We can now get the final score from the updated candidate object in Redux state
    const finalScore = candidate?.finalScore || 0;
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