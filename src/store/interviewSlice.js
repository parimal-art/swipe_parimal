import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = import.meta.env.VITE_API_URL;

// 1. Create Question Set
export const createQuestionSetInDB = createAsyncThunk(
  'interview/createQuestionSetInDB',
  async (questionSetData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/question-set`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questionSetData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create question set');
      }
      return questionSetData;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 2. Fetch Question Set by Code
export const fetchQuestionSetByCode = createAsyncThunk(
  'interview/fetchQuestionSetByCode',
  async (interviewCode, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/question-set/${interviewCode}`);
      if (!response.ok) throw new Error('Invalid Assessment Code');
      const data = await response.json();
      return {
        interview_code: data.interviewCode,
        dashboard_code: data.dashboardCode,
        questions: data.questions,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 3. Fetch Dashboard Data
export const fetchDashboardDataByCode = createAsyncThunk(
  'interview/fetchDashboardDataByCode',
  async (dashboardCode, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/question-set/dashboard/${dashboardCode}`);
      if (!response.ok) throw new Error('Invalid Dashboard Code or failed to fetch data.');
      const data = await response.json();
      const questionSet = {
        interview_code: data.questionSet.interviewCode,
        dashboard_code: data.questionSet.dashboardCode,
        questions: data.questionSet.questions,
      };
      return { questionSet, candidates: data.candidates };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 4. Create Candidate
export const createCandidateInDB = createAsyncThunk(
  'interview/createCandidateInDB',
  async (candidateData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/candidate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(candidateData),
      });
      if (!response.ok) throw new Error('Failed to create candidate');
      const data = await response.json();
      return {
        ...data,
        id: data.id || data._id,
        interview_code: data.interviewCode,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 5. Submit Answer
export const submitAnswerInDB = createAsyncThunk(
  'interview/submitAnswerInDB',
  async ({ candidateId, questionId, questionType, answer, matchedKeywords, score, isCorrect }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/candidate/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateId, questionId, questionType, answer, matchedKeywords, score, isCorrect }),
      });
      if (!response.ok) throw new Error('Failed to submit answer');
      return { candidateId, questionId, questionType, answer, matchedKeywords, score, isCorrect };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 6. Update Candidate Completion
export const updateCandidateOnCompletion = createAsyncThunk(
  'interview/updateCandidateOnCompletion',
  async ({ candidateId, score }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/candidate/${candidateId}/complete`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score }),
      });
      if (!response.ok) throw new Error('Failed to update final score');
      const data = await response.json();
      return {
        id: candidateId,
        status: data.status,
        final_score: data.finalScore,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 7. Update Candidate Status
export const updateCandidateStatusInDB = createAsyncThunk(
  'interview/updateCandidateStatusInDB',
  async ({ candidateId, status }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/candidate/${candidateId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('Failed to update status');
      const data = await response.json();
      return { id: candidateId, status: data.status };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 8. AI Generate Questions (NEW)
export const generateQuestionsWithAI = createAsyncThunk(
  'interview/generateQuestionsWithAI',
  async ({ topic, difficulty, questionType, count, maxScore }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/ai/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, difficulty, questionType, count, maxScore }),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const message = [errData.error, errData.solution, errData.details]
          .filter(Boolean)
          .join('\n\n');
        throw new Error(message || 'AI generation failed');
      }
      const data = await response.json();
      return data.questions;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  questionSets: {},
  candidates: {},
  sessions: {},
  status: 'idle',
  aiStatus: 'idle',
  error: null,
  aiError: null,
};

const interviewSlice = createSlice({
  name: 'interview',
  initialState,
  reducers: {
    createSession: (state, action) => {
      const { sessionId, candidateId, questions } = action.payload;
      state.sessions[sessionId] = {
        sessionId,
        candidateId,
        currentQuestionIndex: 0,
        questions,
      };
    },
    updateSession: (state, action) => {
      const { sessionId, updates } = action.payload;
      if (state.sessions[sessionId]) {
        state.sessions[sessionId] = {
          ...state.sessions[sessionId],
          ...updates,
        };
      }
    },
    deleteSession: (state, action) => {
      const { sessionId } = action.payload;
      delete state.sessions[sessionId];
    },
    clearError: (state) => {
      state.error = null;
      state.aiError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createQuestionSetInDB.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const { interviewCode, dashboardCode, questions } = action.payload;
        state.questionSets[interviewCode] = { interviewCode, dashboardCode, questions };
      })
      .addCase(fetchQuestionSetByCode.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const questionSet = action.payload;
        if (questionSet) {
          state.questionSets[questionSet.interview_code] = {
            interviewCode: questionSet.interview_code,
            dashboardCode: questionSet.dashboard_code,
            questions: questionSet.questions,
          };
        }
      })
      .addCase(fetchDashboardDataByCode.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const { questionSet, candidates } = action.payload;
        state.questionSets[questionSet.interview_code] = {
          interviewCode: questionSet.interview_code,
          dashboardCode: questionSet.dashboard_code,
          questions: questionSet.questions,
        };
        state.candidates = {};
        candidates.forEach((candidate) => {
          state.candidates[candidate.id || candidate._id] = {
            ...candidate,
            id: candidate.id || candidate._id,
            finalScore: candidate.final_score || candidate.finalScore,
          };
        });
      })
      .addCase(createCandidateInDB.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const candidate = action.payload;
        state.candidates[candidate.id] = { ...candidate, answers: [], finalScore: 0 };
      })
      .addCase(submitAnswerInDB.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const { candidateId, ...answerData } = action.payload;
        if (state.candidates[candidateId]) {
          if (!state.candidates[candidateId].answers) state.candidates[candidateId].answers = [];
          state.candidates[candidateId].answers.push(answerData);
        }
      })
      .addCase(updateCandidateOnCompletion.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const updatedCandidate = action.payload;
        if (state.candidates[updatedCandidate.id]) {
          state.candidates[updatedCandidate.id].status = updatedCandidate.status;
          state.candidates[updatedCandidate.id].finalScore = updatedCandidate.final_score;
        }
      })
      .addCase(updateCandidateStatusInDB.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const updatedCandidate = action.payload;
        if (state.candidates[updatedCandidate.id]) {
          state.candidates[updatedCandidate.id].status = updatedCandidate.status;
        }
      })
      // AI Generate
      .addCase(generateQuestionsWithAI.pending, (state) => {
        state.aiStatus = 'loading';
        state.aiError = null;
      })
      .addCase(generateQuestionsWithAI.fulfilled, (state) => {
        state.aiStatus = 'succeeded';
      })
      .addCase(generateQuestionsWithAI.rejected, (state, action) => {
        state.aiStatus = 'failed';
        state.aiError = action.payload;
      })
      .addMatcher(
        (action) => action.type.endsWith('/pending') && !action.type.includes('generateQuestions'),
        (state) => {
          state.status = 'loading';
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.endsWith('/rejected') && !action.type.includes('generateQuestions'),
        (state, action) => {
          state.status = 'failed';
          state.error = action.payload;
        }
      );
  },
});

export const { createSession, updateSession, deleteSession, clearError } = interviewSlice.actions;
export default interviewSlice.reducer;
