import React, { useState } from 'react';
import { SinglePinForm } from './SinglePinForm';
import { BulkUploadForm } from './BulkUploadForm';
import { FileText, Image as ImageIcon } from 'lucide-react';
import { AccountsDropdown } from '../Dashboard/AccountsDropdown';

export function PinScheduler() {
  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm p-6">
      <AccountsDropdown />
      
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('single')}
            className={`
              py-4 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'single'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            <div className="flex items-center space-x-2">
              <ImageIcon className="w-5 h-5" />
              <span>Single Pin</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('bulk')}
            className={`
              py-4 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'bulk'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Bulk Upload</span>
            </div>
          </button>
        </nav>
      </div>

      {activeTab === 'single' ? <SinglePinForm /> : <BulkUploadForm />}
    </div>
  );
}