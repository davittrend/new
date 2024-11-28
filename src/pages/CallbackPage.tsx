import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader, AlertCircle } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { setAuth } from '../store/slices/authSlice';
import { setBoards } from '../store/slices/boardsSlice';
import toast from 'react-hot-toast';

function CallbackPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  useEffect(() => {
    async function handleCallback() {
      if (error || errorDescription) {
        toast.error(errorDescription || error || 'Authentication failed');
        navigate('/', { replace: true });
        return;
      }

      if (!code) {
        toast.error('No authorization code received');
        navigate('/', { replace: true });
        return;
      }

      try {
        // Exchange code for token
        const response = await fetch(`/.netlify/functions/pinterest-auth?path=/token&code=${code}`);
        const data = await response.json();

        if (!response.ok || !data.token || !data.user) {
          throw new Error(data.error || 'Failed to complete authentication');
        }

        // Update Redux store with auth data
        dispatch(setAuth(data));
        
        // Store in localStorage
        localStorage.setItem('pinterest_auth', JSON.stringify(data));

        // Fetch initial boards through our proxy
        try {
          const boardsResponse = await fetch('/.netlify/functions/pinterest-api?path=/boards', {
            headers: {
              'Authorization': `Bearer ${data.token.access_token}`
            }
          });
          
          if (!boardsResponse.ok) {
            throw new Error('Failed to fetch boards');
          }

          const boardsData = await boardsResponse.json();
          dispatch(setBoards(boardsData.items));
          
          toast.success(`Welcome, ${data.user.username}!`);
          navigate('/dashboard', { replace: true });
        } catch (boardError) {
          console.error('Failed to fetch initial boards:', boardError);
          // Still navigate to dashboard, boards will be fetched by useBoards hook
          toast.success(`Welcome, ${data.user.username}!`);
          navigate('/dashboard', { replace: true });
        }
      } catch (error) {
        console.error('Authentication error:', error);
        toast.error('Authentication failed. Please try again.');
        navigate('/', { replace: true });
      }
    }

    handleCallback();
  }, [code, error, errorDescription, navigate, dispatch]);

  if (error || errorDescription) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h1 className="text-xl font-semibold mb-2">Authentication Failed</h1>
          <p className="text-gray-600">{errorDescription || error || 'Access was denied'}</p>
          <button
            onClick={() => navigate('/', { replace: true })}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl text-center">
        <Loader className="animate-spin h-12 w-12 mx-auto mb-4 text-red-500" />
        <h1 className="text-xl font-semibold mb-2">Completing Authentication</h1>
        <p className="text-gray-600">Please wait while we connect your Pinterest account...</p>
      </div>
    </div>
  );
}

export default CallbackPage;