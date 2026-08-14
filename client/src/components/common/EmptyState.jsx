import React from 'react';
import Button from './Button';

const EmptyState = ({ title, message, actionLabel, onAction }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-gradient-to-br from-brand-bg/90 via-primary/20 to-brand-bg/90 bg-[length:200%_200%] animate-gradient-shift backdrop-blur-md border border-white/10 shadow-xl shadow-primary/5 rounded-2xl">
      <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
      <p className="text-white/60 mb-6 max-w-md">{message}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
