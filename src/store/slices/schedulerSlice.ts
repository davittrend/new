import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ScheduledPin {
  id: string;
  title: string;
  description: string;
  link?: string;
  imageUrl: string;
  boardId: string;
  scheduledTime: string;
  status: 'pending' | 'scheduled' | 'published' | 'publishing' | 'failed';
  error?: string;
  publishedAt?: string;
  pinterestId?: string;
}

interface SchedulerState {
  scheduledPins: ScheduledPin[];
  isLoading: boolean;
  error: string | null;
}

const initialState: SchedulerState = {
  scheduledPins: [],
  isLoading: false,
  error: null,
};

const schedulerSlice = createSlice({
  name: 'scheduler',
  initialState,
  reducers: {
    addScheduledPin: (state, action: PayloadAction<ScheduledPin>) => {
      state.scheduledPins.push(action.payload);
    },
    updateScheduledPin: (state, action: PayloadAction<ScheduledPin>) => {
      const index = state.scheduledPins.findIndex(pin => pin.id === action.payload.id);
      if (index !== -1) {
        state.scheduledPins[index] = action.payload;
      }
    },
    removeScheduledPin: (state, action: PayloadAction<string>) => {
      state.scheduledPins = state.scheduledPins.filter(pin => pin.id !== action.payload);
    },
    setSchedulerLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setSchedulerError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
  },
});

export const {
  addScheduledPin,
  updateScheduledPin,
  removeScheduledPin,
  setSchedulerLoading,
  setSchedulerError,
} = schedulerSlice.actions;

export default schedulerSlice.reducer;