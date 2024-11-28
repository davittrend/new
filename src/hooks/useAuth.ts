import { useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { setAuth, logout as logoutAction } from '../store/slices/authSlice';
import toast from 'react-hot-toast';

export interface PinterestAuth {
  token: {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    token_type: string;
  };
  user: {
    username: string;
    [key: string]: any;
  };
}

export function useAuth() {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, userData } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const auth = localStorage.getItem('pinterest_auth');
    if (auth) {
      try {
        const data = JSON.parse(auth) as PinterestAuth;
        dispatch(setAuth(data));
      } catch (error) {
        console.error('Failed to parse auth data:', error);
        localStorage.removeItem('pinterest_auth');
      }
    }
  }, [dispatch]);

  const handleAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/pinterest-auth?path=/oauth/url');
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.url) {
        // Store current URL to return after auth
        localStorage.setItem('pinterest_auth_redirect', window.location.pathname);
        window.location.href = data.url;
      } else {
        throw new Error('Failed to get authentication URL');
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast.error('Failed to initiate authentication. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshToken = useCallback(async () => {
    if (!userData?.token?.refresh_token) {
      return false;
    }

    try {
      const response = await fetch(`/api/pinterest-auth?path=/token&refresh_token=${userData.token.refresh_token}`);
      const data = await response.json();

      if (response.ok && data.token) {
        const updatedAuth = {
          ...userData,
          token: {
            ...userData.token,
            ...data.token
          }
        };
        localStorage.setItem('pinterest_auth', JSON.stringify(updatedAuth));
        dispatch(setAuth(updatedAuth));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  }, [userData, dispatch]);

  const logout = useCallback(() => {
    localStorage.removeItem('pinterest_auth');
    dispatch(logoutAction());
    toast.success('Successfully logged out');
  }, [dispatch]);

  return {
    isLoading,
    isAuthenticated,
    userData,
    handleAuth,
    refreshToken,
    logout
  };
}