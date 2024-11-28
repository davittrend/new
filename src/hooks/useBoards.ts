import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setBoards, setBoardsLoading, setBoardsError } from '../store/slices/boardsSlice';
import { RootState } from '../store/store';
import { useAuth } from './useAuth';
import toast from 'react-hot-toast';

export function useBoards() {
  const dispatch = useDispatch();
  const { userData, refreshToken } = useAuth();
  const { items: boards, isLoading, error } = useSelector((state: RootState) => state.boards);

  useEffect(() => {
    const fetchBoards = async () => {
      if (!userData?.token?.access_token) return;

      dispatch(setBoardsLoading(true));
      try {
        const response = await fetch('/.netlify/functions/pinterest-api?path=/boards', {
          headers: {
            'Authorization': `Bearer ${userData.token.access_token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            const refreshed = await refreshToken();
            if (refreshed) {
              // Retry the request
              return fetchBoards();
            }
            throw new Error('Session expired. Please log in again.');
          }
          throw new Error('Failed to fetch boards');
        }

        const data = await response.json();
        dispatch(setBoards(data.items || []));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch boards';
        dispatch(setBoardsError(errorMessage));
        toast.error(errorMessage);
      } finally {
        dispatch(setBoardsLoading(false));
      }
    };

    if (userData?.token?.access_token) {
      fetchBoards();
    }
  }, [dispatch, userData?.token?.access_token, refreshToken]);

  return { boards, isLoading, error };
}