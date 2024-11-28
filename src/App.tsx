import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import AccountsPage from './pages/AccountsPage';
import ScheduledPinsPage from './pages/ScheduledPinsPage';
import SettingsPage from './pages/SettingsPage';
import { PrivateRoute } from './routes/PrivateRoute';
import { PublicRoute } from './routes/PublicRoute';
import { setupTokenRefresh } from './utils/tokenManager';

function App() {
  useEffect(() => {
    setupTokenRefresh();
  }, []);

  return (
    <>
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 5000,
          success: {
            style: {
              background: '#10B981',
              color: 'white',
            },
          },
          error: {
            style: {
              background: '#EF4444',
              color: 'white',
            },
            duration: 6000,
          },
        }}
      />
      <Routes>
        <Route 
          path="/" 
          element={
            <PublicRoute>
              <HomePage />
            </PublicRoute>
          } 
        />
        <Route 
          path="/auth" 
          element={
            <PublicRoute>
              <AuthPage />
            </PublicRoute>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/dashboard/accounts" 
          element={
            <PrivateRoute>
              <AccountsPage />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/dashboard/scheduled" 
          element={
            <PrivateRoute>
              <ScheduledPinsPage />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/dashboard/settings" 
          element={
            <PrivateRoute>
              <SettingsPage />
            </PrivateRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;