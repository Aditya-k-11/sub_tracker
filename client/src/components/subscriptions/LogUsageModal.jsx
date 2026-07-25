import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';

const LogUsageModal = ({ isOpen, onClose, subscription, onSubmit, submitting }) => {
  const [note, setNote] = useState('');

  useEffect(() => {
    if (isOpen) {
      setNote('');
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(note);
  };

  if (!subscription) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Log Usage — ${subscription.name}`}>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            What did you use it for? (optional)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 min-h-[100px]"
            placeholder="e.g. Watched Stranger Things"
          />
        </div>
        <div className="flex justify-end space-x-3 border-t border-gray-200 pt-4">
          <button 
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded font-medium transition"
          >
            Cancel
          </button>
          <button 
            type="submit"
            disabled={submitting}
            className={`px-4 py-2 text-white bg-primary-600 hover:bg-primary-700 rounded font-medium transition flex items-center ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {submitting ? 'Logging...' : 'Log Usage'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default LogUsageModal;
