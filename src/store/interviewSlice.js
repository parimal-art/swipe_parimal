// src/store/interviewSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../lib/supabase';

// --- ASYNC THUNKS FOR DATABASE OPERATIONS ---

// 1. Naya Question Set database mein create karne ke liye
export const createQuestionSetInDB = createAsyncThunk(
  'interview/createQuestionSetInDB',
  async (questionSetData, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase.from('question_sets').insert([
        {
          interview_code: questionSetData.interviewCode,
          dashboard_code: questionSetData.dashboardCode,
          questions: questionSetData.questions,
        },
      ]);
      if (error) throw error;
      return questionSetData;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 2. Interview code se questions fetch karne ke liye (Candidate ke liye)
export const fetchQuestionSetByCode = createAsyncThunk(
  'interview/fetchQuestionSetByCode',
  async (interviewCode, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('question_sets')
        .select('*')
        .eq('interview_code', interviewCode.toUpperCase())
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      return rejectWithValue('Invalid Interview Code');
    }
  }
);

// 3. Dashboard code se saara data fetch karne ke liye (Interviewer ke liye)
export const fetchDashboardDataByCode = createAsyncThunk(
  'interview/fetchDashboardDataByCode',
  async (dashboardCode, { rejectWithValue }) => {
    try {
      const { data: questionSet, error: qsError } = await supabase
        .from('question_sets')
        .select('*')
        .eq('dashboard_code', dashboardCode.toUpperCase())
        .single();
      if (qsError) throw qsError;

      const { data: candidates, error: candidatesError } = await supabase
        .from('candidates')
        .select('*, answers(*)')
        .eq('interview_code', questionSet.interview_code);
      if (candidatesError) throw candidatesError;

      return { questionSet, candidates };
    } catch (error) {
      return rejectWithValue(
        'Invalid Dashboard Code or failed to fetch data.'
      );
    }
  }
);

// 4. Naya candidate database mein create karne ke liye
export const createCandidateInDB = createAsyncThunk(
  'interview/createCandidateInDB',
  async (candidateData, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('candidates')
        .insert([
          {
            interview_code: candidateData.interviewCode,
            name: candidateData.name,
            email: candidateData.email,
            phone: candidateData.phone,
            status: 'in_progress',
            final_score: 0,
          },
        ])
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 5. Candidate ka answer database mein submit karne ke liye
export const submitAnswerInDB = createAsyncThunk(
  'interview/submitAnswerInDB',
  async (
    { candidateId, questionId, answer, matchedKeywords, score },
    { rejectWithValue }
  ) => {
    try {
      const { data, error } = await supabase.from('answers').insert([
        {
          candidate_id: candidateId,
          question_id: questionId,
          answer: answer,
          matched_keywords: matchedKeywords,
          score: score,
        },
      ]);
      if (error) throw error;
      return { candidateId, questionId, answer, matchedKeywords, score };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 6. Interview complete hone par candidate ka status aur final score update karne ke liye
export const updateCandidateOnCompletion = createAsyncThunk(
  'interview/updateCandidateOnCompletion',
  async ({ candidateId, score }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('candidates')
        .update({ final_score: score, status: 'completed' })
        .eq('id', candidateId)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ====================================================================
// 7. NEW THUNK: Candidate ka status update karne ke liye (e.g., 'abandoned')
// ====================================================================
export const updateCandidateStatusInDB = createAsyncThunk(
  'interview/updateCandidateStatusInDB',
  async ({ candidateId, status }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('candidates')
        .update({ status: status })
        .eq('id', candidateId)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// --- SLICE DEFINITION ---

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
      // --- FULFILLED CASES (saare .addCase pehle aayenge) ---

      .addCase(createQuestionSetInDB.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const { interviewCode, dashboardCode, questions } = action.payload;
        state.questionSets[interviewCode] = {
          interviewCode,
          dashboardCode,
          questions,
        };
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
          state.candidates[candidate.id] = {
            ...candidate,
            finalScore: candidate.final_score,
          };
        });
      })
      .addCase(createCandidateInDB.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const candidate = action.payload;
        state.candidates[candidate.id] = {
          ...candidate,
          answers: [],
          finalScore: candidate.final_score,
        };
      })
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
      .addCase(updateCandidateOnCompletion.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const updatedCandidate = action.payload;
        if (state.candidates[updatedCandidate.id]) {
          state.candidates[updatedCandidate.id].status =
            updatedCandidate.status;
          state.candidates[updatedCandidate.id].finalScore =
            updatedCandidate.final_score;
        }
      })
      // ====================================================================
      // NEW REDUCER CASE: Handle state update for the new thunk
      // ====================================================================
      .addCase(updateCandidateStatusInDB.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const updatedCandidate = action.payload;
        if (state.candidates[updatedCandidate.id]) {
          state.candidates[updatedCandidate.id].status =
            updatedCandidate.status;
        }
      })

      // --- GENERIC MATCHER CASES (saare .addMatcher ab end mein aayenge) ---

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

export const { createSession, updateSession, deleteSession, clearError } =
  interviewSlice.actions;

export default interviewSlice.reducer;