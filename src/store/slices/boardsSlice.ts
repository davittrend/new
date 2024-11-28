import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface PinterestBoard {
  id: string;
  name: string;
  description?: string;
  url: string;
  privacy: string;
  owner: {
    username: string;
  };
}

interface BoardsState {
  items: PinterestBoard[];
  isLoading: boolean;
  error: string | null;
}

const initialState: BoardsState = {
  items: [],
  isLoading: false,
  error: null,
};

const boardsSlice = createSlice({
  name: 'boards',
  initialState,
  reducers: {
    setBoards: (state, action: PayloadAction<PinterestBoard[]>) => {
      state.items = action.payload;
      state.error = null;
    },
    setBoardsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setBoardsError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
  },
});

export const { setBoards, setBoardsLoading, setBoardsError } = boardsSlice.actions;
export default boardsSlice.reducer;