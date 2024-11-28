import { FC, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ChevronDown, Plus, Trash2, UserCircle } from 'lucide-react';
import { RootState } from '../../store/store';
import { useAuth } from '../../hooks/useAuth';
import { setAuth, removePinterestAccount } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';

export const AccountsDropdown: FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();
  const { handleAuth } = useAuth();
  const { userData, pinterestAccounts } = useSelector((state: RootState) => state.auth);

  const handleAddAccount = async () => {
    try {
      await handleAuth();
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to add account:', error);
      toast.error('Failed to add Pinterest account');
    }
  };

  const handleRemoveAccount = (username: string) => {
    if (window.confirm('Are you sure you want to remove this account?')) {
      dispatch(removePinterestAccount(username));
      toast.success('Account removed successfully');
      setIsOpen(false);
    }
  };

  const switchAccount = (account: any) => {
    dispatch(setAuth(account));
    setIsOpen(false);
    toast.success(`Switched to ${account.user.username}`);
  };

  return (
    <div className="mb-6">
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50"
        >
          <div className="flex items-center">
            <UserCircle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-sm font-medium text-gray-700">
              {userData?.user?.username || 'Select Account'}
            </span>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </button>

        {isOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
            <div className="py-1">
              {pinterestAccounts.map((account) => (
                <div
                  key={account.user.username}
                  className="flex items-center justify-between px-4 py-2 hover:bg-gray-50"
                >
                  <button
                    onClick={() => switchAccount(account)}
                    className="flex items-center flex-grow"
                  >
                    <UserCircle className="w-4 h-4 text-gray-500 mr-2" />
                    <span className="text-sm text-gray-700">{account.user.username}</span>
                  </button>
                  {pinterestAccounts.length > 1 && (
                    <button
                      onClick={() => handleRemoveAccount(account.user.username)}
                      className="p-1 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={handleAddAccount}
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Pinterest Account
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};