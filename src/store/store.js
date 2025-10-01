import { configureStore } from '@reduxjs/toolkit';
import interviewReducer from './interviewSlice';

export const store = configureStore({
  reducer: {
    interview: interviewReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: true, 
    }),
});