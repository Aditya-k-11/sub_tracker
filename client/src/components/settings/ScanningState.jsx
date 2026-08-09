import React from 'react';
import Spinner from '../common/Spinner';

const ScanningState = () => {
  return (
    <div className="flex flex-col items-center justify-center py-8 space-y-4 bg-gradient-to-br from-brand-bg/90 via-primary/20 to-brand-bg/90 bg-[length:200%_200%] animate-gradient-shift backdrop-blur-md rounded-2xl shadow-xl shadow-primary/5 border border-white/10">
      <Spinner size="lg" />
      <div className="text-center">
        <h3 className="text-sm font-medium text-brand-text">Scanning your inbox for subscriptions</h3>
        <p className="text-sm text-brand-text/70 mt-1">This can take a moment depending on how many emails we find.</p>
      </div>
    </div>
  );
};

export default ScanningState;
