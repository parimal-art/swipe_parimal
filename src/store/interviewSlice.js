import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// MERN Backend API URL (Ensure your Node server is running on port 5000)
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

      // Return original data to update Redux state immediately
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
      
      if (!response.ok) {
        throw new Error('Invalid Interview Code');
      }

      const data = await response.json();

      // Mapping MongoDB camelCase to Redux snake_case expectation
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
      const response = await fetch(`${API_URL}/dashboard/${dashboardCode}`);

      if (!response.ok) {
        throw new Error('Invalid Dashboard Code or failed to fetch data.');
      }

      const data = await response.json();
      
      // Data is expected to be { questionSet, candidates } from the backend
      // Ensure specific field mapping if backend doesn't handle it
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

      if (!response.ok) {
        throw new Error('Failed to create candidate');
      }

      const data = await response.json();

      // Normalize MongoDB _id to id for frontend use
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
  async ({ candidateId, questionId, answer, matchedKeywords, score }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId,
          questionId,
          answer,
          matchedKeywords,
          score,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit answer');
      }

      // Return payload to update Redux state
      return { candidateId, questionId, answer, matchedKeywords, score };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 6. Update Candidate Completion (Final Score)
export const updateCandidateOnCompletion = createAsyncThunk(
  'interview/updateCandidateOnCompletion',
  async ({ candidateId, score }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/candidate/${candidateId}/complete`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score }),
      });

      if (!response.ok) {
        throw new Error('Failed to update final score');
      }

      const data = await response.json();
      
      return {
        id: candidateId,
        status: data.status,
        final_score: data.finalScore, // Mapping for reducer
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 7. Update Candidate Status (e.g., Abandoned)
// Note: You need to ensure your backend has a route for this, 
// or use the same update endpoint as above with different body.
export const updateCandidateStatusInDB = createAsyncThunk(
  'interview/updateCandidateStatusInDB',
  async ({ candidateId, status }, { rejectWithValue }) => {
    try {
      // Assuming a generic update route exists on backend
      // If not, you can create one: router.put('/candidate/:id/status', ...)
      const response = await fetch(`${API_URL}/candidate/${candidateId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
         // Fallback: If specific status route doesn't exist, try generic update if you have one
         // For now, throwing error to alert dev to create the route
        throw new Error('Failed to update status');
      }

      const data = await response.json();
      return {
        id: candidateId,
        status: data.status,
      };
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
  error: null,
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
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Question Set
      .addCase(createQuestionSetInDB.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const { interviewCode, dashboardCode, questions } = action.payload;
        state.questionSets[interviewCode] = {
          interviewCode,
          dashboardCode,
          questions,
        };
      })
      // Fetch Question Set
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
      // Fetch Dashboard
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
          // Mapping Mongo data to State
          state.candidates[candidate.id || candidate._id] = {
            ...candidate,
            id: candidate.id || candidate._id,
            finalScore: candidate.final_score || candidate.finalScore,
          };
        });
      })
      // Create Candidate
      .addCase(createCandidateInDB.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const candidate = action.payload;
        state.candidates[candidate.id] = {
          ...candidate,
          answers: [],
          finalScore: 0,
        };
      })
      // Submit Answer
      .addCase(submitAnswerInDB.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const { candidateId, ...answerData } = action.payload;
        if (state.candidates[candidateId]) {
          if (!state.candidates[candidateId].answers) {
            state.candidates[candidateId].answers = [];
          }
          state.candidates[candidateId].answers.push(answerData);
        }
      })
      // Update Completion
      .addCase(updateCandidateOnCompletion.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const updatedCandidate = action.payload;
        if (state.candidates[updatedCandidate.id]) {
          state.candidates[updatedCandidate.id].status = updatedCandidate.status;
          state.candidates[updatedCandidate.id].finalScore = updatedCandidate.final_score;
        }
      })
      // Update Status (Abandoned)
      .addCase(updateCandidateStatusInDB.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const updatedCandidate = action.payload;
        if (state.candidates[updatedCandidate.id]) {
          state.candidates[updatedCandidate.id].status = updatedCandidate.status;
        }
      })

      // Loading & Error States
      .addMatcher(
        (action) => action.type.endsWith('/pending'),
        (state) => {
          state.status = 'loading';
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.endsWith('/rejected'),
        (state, action) => {
          state.status = 'failed';
          state.error = action.payload;
        }
      );
  },
});

export const { createSession, updateSession, deleteSession, clearError } = interviewSlice.actions;

export default interviewSlice.reducer;