import React from 'react';
import { DashboardLayout } from '../components/Dashboard/DashboardLayout';
import { useSelector, useDispatch } from 'react-redux';
import { useAuth } from '../hooks/useAuth';
import { RootState } from '../store/store';
import { Plus, Trash2, UserCircle } from 'lucide-react';
import { removePinterestAccount } from '../store/slices/authSlice';
import toast from 'react-hot-toast';

function AccountsPage() {
  const dispatch = useDispatch();
  const { handleAuth } = useAuth();
  const { pinterestAccounts } = useSelector((state: RootState) => state.auth);

  const handleAddAccount = async () => {
    try {
      await handleAuth();
    } catch (error) {
      console.error('Failed to add account:', error);
      toast.error('Failed to add Pinterest account');
    }
  };

  const handleRemoveAccount = (username: string) => {
    if (window.confirm('Are you sure you want to remove this account?')) {
      dispatch(removePinterestAccount(username));
      toast.success('Account removed successfully');
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Pinterest Accounts</h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage your connected Pinterest accounts
            </p>
          </div>
          
          <div className="divide-y divide-gray-200">
            {pinterestAccounts.map((account) => (
              <div key={account.user.username} className="p-6 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <UserCircle className="h-10 w-10 text-red-500" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      {account.user.username}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Connected account
                    </p>
                  </div>
                </div>
                {pinterestAccounts.length > 1 && (
                  <button
                    onClick={() => handleRemoveAccount(account.user.username)}
                    className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="p-6 bg-gray-50">
            <button
              onClick={handleAddAccount}
              className="flex items-center justify-center w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Another Pinterest Account
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default AccountsPage;