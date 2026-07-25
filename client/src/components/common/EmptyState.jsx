import React from 'react';

const EmptyState = ({ title, message, actionLabel, onAction }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-6 max-w-md">{message}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="bg-primary-600 text-white px-4 py-2 rounded shadow-sm hover:bg-primary-700 transition"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
