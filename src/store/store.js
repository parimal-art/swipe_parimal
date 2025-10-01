import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import localforage from 'localforage';
import interviewReducer from './interviewSlice';

const persistConfig = {
  key: 'interview-assistant',
  storage: localforage,
  version: 1,
};

const persistedReducer = persistReducer(persistConfig, interviewReducer);

export const store = configureStore({
  reducer: {
    interview: persistedReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);
