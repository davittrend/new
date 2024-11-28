import { addDays, isBefore } from 'date-fns';
import { store } from '../store/store';
import { setAuth, removePinterestAccount } from '../store/slices/authSlice';
import toast from 'react-hot-toast';

interface TokenData {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

interface TokenMetadata {
  username: string;
  refreshDate: string;
}

const TOKEN_METADATA_KEY = 'pinterest_token_metadata';

export const setupTokenRefresh = () => {
  // Check tokens every hour
  setInterval(checkTokensForRefresh, 1000 * 60 * 60);
  // Also check immediately on setup
  checkTokensForRefresh();
};

const checkTokensForRefresh = async () => {
  const metadata = getTokenMetadata();
  const now = new Date();

  for (const entry of metadata) {
    const refreshDate = new Date(entry.refreshDate);
    if (isBefore(refreshDate, now)) {
      await refreshAccountToken(entry.username);
    }
  }
};

export const addTokenMetadata = (username: string) => {
  const metadata = getTokenMetadata();
  const refreshDate = addDays(new Date(), 27); // Refresh 3 days before expiration

  const updatedMetadata = [
    ...metadata.filter(m => m.username !== username),
    { username, refreshDate: refreshDate.toISOString() }
  ];

  localStorage.setItem(TOKEN_METADATA_KEY, JSON.stringify(updatedMetadata));
};

export const removeTokenMetadata = (username: string) => {
  const metadata = getTokenMetadata();
  const updatedMetadata = metadata.filter(m => m.username !== username);
  localStorage.setItem(TOKEN_METADATA_KEY, JSON.stringify(updatedMetadata));
};

const getTokenMetadata = (): TokenMetadata[] => {
  try {
    const stored = localStorage.getItem(TOKEN_METADATA_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to parse token metadata:', error);
    return [];
  }
};

const refreshAccountToken = async (username: string) => {
  const state = store.getState();
  const account = state.auth.pinterestAccounts.find(
    acc => acc.user.username === username
  );

  if (!account?.token.refresh_token) {
    console.error(`No refresh token found for account: ${username}`);
    return;
  }

  try {
    const response = await fetch(`/.netlify/functions/pinterest-auth?path=/token&refresh_token=${account.token.refresh_token}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Token refresh failed');
    }

    if (data.token) {
      // Update the account's token in the store
      const updatedAccount = {
        ...account,
        token: {
          ...account.token,
          ...data.token
        }
      };

      store.dispatch(setAuth(updatedAccount));
      
      // Update token metadata with new refresh date
      addTokenMetadata(username);
      
      console.log(`Successfully refreshed token for ${username}`);
    }
  } catch (error) {
    console.error(`Failed to refresh token for ${username}:`, error);
    toast.error(`Failed to refresh Pinterest access for ${username}. Please reconnect the account.`);
    store.dispatch(removePinterestAccount(username));
    removeTokenMetadata(username);
  }
};