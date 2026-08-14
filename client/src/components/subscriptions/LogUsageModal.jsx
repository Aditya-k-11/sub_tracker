import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';

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
          <label className="block text-white/80 font-medium mb-2">
            What did you use it for? (optional)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full bg-black/20 text-white border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 min-h-[100px]"
            placeholder="e.g. Watched Stranger Things"
          />
        </div>
        <div className="flex justify-end space-x-3 border-t border-white/10 pt-4">
          <Button 
            variant="secondary"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            loading={submitting}
          >
            Log Usage
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default LogUsageModal;
