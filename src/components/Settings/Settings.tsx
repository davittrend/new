import { FC, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Bell, Shield, Clock, RefreshCw } from 'lucide-react';
import { RootState } from '../../store/store';
import toast from 'react-hot-toast';

export const Settings: FC = () => {
  const { userData } = useSelector((state: RootState) => state.auth);
  const [notifications, setNotifications] = useState({
    pinScheduled: true,
    pinPublished: true,
    pinFailed: true,
  });
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);

  const handleRefreshToken = async () => {
    try {
      const refreshToken = userData?.token?.refresh_token;
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(`/api/pinterest-auth?path=/token&refresh_token=${refreshToken}`);
      const data = await response.json();

      if (response.ok && data.token) {
        // Update local storage with new token
        const updatedAuth = {
          ...userData,
          token: {
            ...userData.token,
            ...data.token
          }
        };
        localStorage.setItem('pinterest_auth', JSON.stringify(updatedAuth));
        toast.success('Token refreshed successfully');
      } else {
        throw new Error(data.error || 'Failed to refresh token');
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      toast.error('Failed to refresh token. Please try logging in again.');
    }
  };

  // Get available timezones
  const timezones = [
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Australia/Sydney'
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-gray-500" />
              <div>
                <p className="font-medium">Pinterest Account</p>
                <p className="text-sm text-gray-500">{userData?.user?.username}</p>
              </div>
            </div>
            <button
              onClick={handleRefreshToken}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh Token</span>
            </button>
          </div>

          <div className="p-4 border rounded-lg">
            <div className="flex items-center space-x-3 mb-4">
              <Bell className="w-5 h-5 text-gray-500" />
              <h3 className="font-medium">Notifications</h3>
            </div>
            <div className="space-y-3">
              {Object.entries(notifications).map(([key, enabled]) => (
                <label key={key} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {key === 'pinScheduled' && 'When pin is scheduled'}
                    {key === 'pinPublished' && 'When pin is published'}
                    {key === 'pinFailed' && 'When pin fails to publish'}
                  </span>
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => setNotifications(prev => ({
                      ...prev,
                      [key]: e.target.checked
                    }))}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <div className="flex items-center space-x-3 mb-4">
              <Clock className="w-5 h-5 text-gray-500" />
              <h3 className="font-medium">Time Settings</h3>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-2">Timezone</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
              >
                {timezones.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Danger Zone</h2>
        <div className="border border-red-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-red-600 mb-2">Disconnect Pinterest Account</h3>
          <p className="text-sm text-gray-500 mb-4">
            This will remove access to your Pinterest account and delete all scheduled pins.
          </p>
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to disconnect your Pinterest account?')) {
                localStorage.removeItem('pinterest_auth');
                window.location.href = '/';
              }
            }}
            className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-medium"
          >
            Disconnect Account
          </button>
        </div>
      </div>
    </div>
  );
};