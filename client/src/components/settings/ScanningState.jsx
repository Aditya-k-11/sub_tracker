import React from 'react';
import Spinner from '../common/Spinner';

const ScanningState = () => {
  return (
    <div className="flex flex-col items-center justify-center py-8 space-y-4 bg-white rounded-2xl shadow-sm border border-gray-100">
      <Spinner size="lg" />
      <div className="text-center">
        <h3 className="text-sm font-medium text-gray-900">Scanning your inbox for subscriptions</h3>
        <p className="text-sm text-gray-500 mt-1">This can take a moment depending on how many emails we find.</p>
      </div>
    </div>
  );
};

export default ScanningState;
