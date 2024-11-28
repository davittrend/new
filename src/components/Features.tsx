import React from 'react';
import { Lock, Key, CheckCircle2 } from 'lucide-react';

interface FeaturesProps {
  isAuthenticated: boolean;
}

export function Features({ isAuthenticated }: FeaturesProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4 text-gray-600">
        <Lock className="w-6 h-6 text-red-500" />
        <span>Secure OAuth 2.0 Authentication</span>
      </div>
      <div className="flex items-center space-x-4 text-gray-600">
        <Key className="w-6 h-6 text-red-500" />
        <span>API Access Management</span>
      </div>
      {isAuthenticated && (
        <div className="flex items-center space-x-4 text-green-600">
          <CheckCircle2 className="w-6 h-6" />
          <span>Successfully Connected</span>
        </div>
      )}
    </div>
  );
}