// src/store/interviewSlice.js

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  questionSets: {},
  candidates: {},
  sessions: {},
};

const interviewSlice = createSlice({
  name: 'interview',
  initialState,
  reducers: {
    createQuestionSet: (state, action) => {
      const { interviewCode, dashboardCode, questions } = action.payload;
      state.questionSets[interviewCode] = {
        interviewCode,
        dashboardCode,
        questions,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    },

    addQuestion: (state, action) => {
      const { interviewCode, question } = action.payload;
      if (state.questionSets[interviewCode]) {
        state.questionSets[interviewCode].questions.push(question);
        state.questionSets[interviewCode].updatedAt = new Date().toISOString();
      }
    },

    createCandidate: (state, action) => {
      const { id, interviewCode, name, email, phone } = action.payload;
      state.candidates[id] = {
        id,
        interviewCode,
        name,
        email,
        phone,
        status: 'in_progress',
        finalScore: 0,
        answers: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    },

    updateCandidateStatus: (state, action) => {
      const { candidateId, status } = action.payload;
      if (state.candidates[candidateId]) {
        state.candidates[candidateId].status = status;
        state.candidates[candidateId].updatedAt = new Date().toISOString();
      }
    },

    submitAnswer: (state, action) => {
      const { candidateId, questionId, answer, matchedKeywords, score } = action.payload;
      if (state.candidates[candidateId]) {
        state.candidates[candidateId].answers.push({
          questionId,
          answer,
          matchedKeywords,
          score,
          submittedAt: new Date().toISOString(),
        });
        state.candidates[candidateId].updatedAt = new Date().toISOString();
      }
    },

    updateFinalScore: (state, action) => {
      const { candidateId, score } = action.payload;
      if (state.candidates[candidateId]) {
        state.candidates[candidateId].finalScore = score;
        state.candidates[candidateId].updatedAt = new Date().toISOString();
      }
    },

    createSession: (state, action) => {
      const { sessionId, candidateId, questions } = action.payload;
      state.sessions[sessionId] = {
        sessionId,
        candidateId,
        currentQuestionIndex: 0,
        questions,
        timerRemaining: 0,
        paused: false,
        updatedAt: new Date().toISOString(),
      };
    },

    updateSession: (state, action) => {
      const { sessionId, updates } = action.payload;
      if (state.sessions[sessionId]) {
        state.sessions[sessionId] = {
          ...state.sessions[sessionId],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
      }
    },

    deleteSession: (state, action) => {
      const { sessionId } = action.payload;
      delete state.sessions[sessionId];
    },
  },
});

export const {
  createQuestionSet,
  addQuestion,
  createCandidate,
  updateCandidateStatus,
  submitAnswer,
  updateFinalScore,
  createSession,
  updateSession,
  deleteSession,
} = interviewSlice.actions;

export default interviewSlice.reducer;