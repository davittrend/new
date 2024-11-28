import { FC } from 'react';
import { Loader, LogOut, User } from 'lucide-react';

interface AuthButtonProps {
  isLoading: boolean;
  isAuthenticated: boolean;
  onClick: () => void;
  onLogout?: () => void;
  username?: string;
}

export const AuthButton: FC<AuthButtonProps> = ({ 
  isLoading, 
  isAuthenticated, 
  onClick, 
  onLogout, 
  username 
}) => {
  if (isAuthenticated && username) {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-red-50 rounded-lg flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <User className="w-5 h-5 text-red-500" />
            <div>
              <p className="text-sm text-gray-600">Connected as</p>
              <p className="font-medium text-gray-900">{username}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"
            title="Disconnect account"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-all
        ${isLoading 
          ? 'bg-gray-400 cursor-not-allowed' 
          : 'bg-red-500 hover:bg-red-600 active:bg-red-700'
        }`}
    >
      {isLoading ? (
        <span className="flex items-center justify-center">
          <Loader className="animate-spin h-5 w-5 mr-3" />
          Connecting...
        </span>
      ) : (
        'Connect Pinterest Account'
      )}
    </button>
  );
};