import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PinterestAuth } from '../../hooks/useAuth';
import { addTokenMetadata, removeTokenMetadata } from '../../utils/tokenManager';

interface AuthState {
  isAuthenticated: boolean;
  userData: PinterestAuth | null;
  isLoading: boolean;
  error: string | null;
  pinterestAccounts: PinterestAuth[];
}

const getInitialState = (): AuthState => {
  try {
    const storedAuth = localStorage.getItem('pinterest_auth');
    const storedAccounts = localStorage.getItem('pinterest_accounts');
    
    const userData = storedAuth ? JSON.parse(storedAuth) : null;
    const accounts = storedAccounts ? JSON.parse(storedAccounts) : [];
    
    return {
      isAuthenticated: !!userData,
      userData,
      isLoading: false,
      error: null,
      pinterestAccounts: accounts,
    };
  } catch (error) {
    console.error('Failed to parse stored auth data:', error);
    return {
      isAuthenticated: false,
      userData: null,
      isLoading: false,
      error: null,
      pinterestAccounts: [],
    };
  }
};

const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialState(),
  reducers: {
    setAuth: (state, action: PayloadAction<PinterestAuth>) => {
      state.isAuthenticated = true;
      state.userData = action.payload;
      state.error = null;
      
      // Add to Pinterest accounts if not already present
      const exists = state.pinterestAccounts.some(
        account => account.user.username === action.payload.user.username
      );
      
      if (!exists) {
        state.pinterestAccounts.push(action.payload);
        // Update localStorage
        localStorage.setItem('pinterest_accounts', JSON.stringify(state.pinterestAccounts));
        // Add token metadata for refresh scheduling
        addTokenMetadata(action.payload.user.username);
      }
      
      // Update current auth data in localStorage
      localStorage.setItem('pinterest_auth', JSON.stringify(action.payload));
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    logout: (state) => {
      // Remove token metadata for all accounts
      state.pinterestAccounts.forEach(account => {
        removeTokenMetadata(account.user.username);
      });
      
      state.isAuthenticated = false;
      state.userData = null;
      state.error = null;
      state.pinterestAccounts = [];
      localStorage.removeItem('pinterest_auth');
      localStorage.removeItem('pinterest_accounts');
    },
    removePinterestAccount: (state, action: PayloadAction<string>) => {
      // Remove token metadata for the account
      removeTokenMetadata(action.payload);
      
      state.pinterestAccounts = state.pinterestAccounts.filter(
        account => account.user.username !== action.payload
      );
      
      // Update localStorage
      localStorage.setItem('pinterest_accounts', JSON.stringify(state.pinterestAccounts));
      
      // If current account is removed, switch to another account or clear auth
      if (state.userData?.user.username === action.payload) {
        if (state.pinterestAccounts.length > 0) {
          state.userData = state.pinterestAccounts[0];
          state.isAuthenticated = true;
          localStorage.setItem('pinterest_auth', JSON.stringify(state.pinterestAccounts[0]));
        } else {
          state.userData = null;
          state.isAuthenticated = false;
          localStorage.removeItem('pinterest_auth');
        }
      }
    },
  },
});

export const { 
  setAuth, 
  setLoading, 
  setError, 
  logout,
  removePinterestAccount 
} = authSlice.actions;

export default authSlice.reducer;