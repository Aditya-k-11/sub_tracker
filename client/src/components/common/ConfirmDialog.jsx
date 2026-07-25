import React from 'react';
import Modal from './Modal';

const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmLabel = 'Confirm', 
  confirmVariant = 'primary', 
  loading 
}) => {
  const buttonColor = confirmVariant === 'danger' 
    ? 'bg-red-600 hover:bg-red-700' 
    : 'bg-primary-600 hover:bg-primary-700';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <p className="text-gray-700 mb-6">{message}</p>
      <div className="flex justify-end space-x-3 border-t border-gray-200 pt-4">
        <button 
          onClick={onClose}
          disabled={loading}
          className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded font-medium transition"
        >
          Cancel
        </button>
        <button 
          onClick={onConfirm}
          disabled={loading}
          className={`px-4 py-2 text-white rounded font-medium transition flex items-center ${buttonColor} ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {loading ? 'Processing...' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
