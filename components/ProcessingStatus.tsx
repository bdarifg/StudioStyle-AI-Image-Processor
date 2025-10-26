import React from 'react';
import { SpinnerIcon, ClockIcon } from './Icons';

interface ProcessingStatusProps {
  pendingCount: number;
  processingCount: number;
  concurrencyLimit: number;
}

const ProcessingStatus: React.FC<ProcessingStatusProps> = ({ pendingCount, processingCount, concurrencyLimit }) => {
  return (
    <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 flex justify-center items-center space-x-6 text-sm text-gray-700">
      <div className="flex items-center">
        <SpinnerIcon className="w-5 h-5 mr-2 animate-spin text-primary-600" />
        <span>
          Processing: <strong className="font-semibold text-gray-900">{processingCount} / {concurrencyLimit}</strong>
        </span>
      </div>
      <div className="h-6 w-px bg-gray-200"></div> {/* Divider */}
      <div className="flex items-center">
        <ClockIcon className="w-5 h-5 mr-2 text-gray-500" />
        <span>
          Pending: <strong className="font-semibold text-gray-900">{pendingCount}</strong>
        </span>
      </div>
    </div>
  );
};

export default ProcessingStatus;
