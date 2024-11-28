import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import boardsReducer from './slices/boardsSlice';
import schedulerReducer from './slices/schedulerSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    boards: boardsReducer,
    scheduler: schedulerReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;