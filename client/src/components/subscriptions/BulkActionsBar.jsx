import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Tag } from 'lucide-react';
import ConfirmDialog from '../common/ConfirmDialog';

const BulkActionsBar = ({ selectedCount, onBulkCancel, onBulkRecategorize, onClearSelection, processing }) => {
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [showRecategorize, setShowRecategorize] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');

  const handleConfirmCancel = async () => {
    await onBulkCancel();
    setShowConfirmCancel(false);
  };

  const handleRecategorizeSubmit = async () => {
    if (selectedCategory) {
      await onBulkRecategorize(selectedCategory);
      setShowRecategorize(false);
      setSelectedCategory('');
    }
  };

  return (
    <>
      <AnimatePresence>
        {selectedCount > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-2xl bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-2xl flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <span className="bg-primary-500/20 text-primary-400 px-3 py-1 rounded-full text-sm font-semibold">
                {selectedCount} selected
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                {showRecategorize ? (
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="bg-black/40 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary-500"
                    >
                      <option value="" disabled>Select Category...</option>
                      <option value="Entertainment">Entertainment</option>
                      <option value="Fitness">Fitness</option>
                      <option value="Productivity">Productivity</option>
                      <option value="Utilities">Utilities</option>
                      <option value="Other">Other</option>
                    </select>
                    <button
                      onClick={handleRecategorizeSubmit}
                      disabled={!selectedCategory || processing}
                      className="bg-primary-500 hover:bg-primary-400 text-white px-3 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
                    >
                      Apply
                    </button>
                    <button
                      onClick={() => setShowRecategorize(false)}
                      className="p-2 text-white/50 hover:text-white/80 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowRecategorize(true)}
                    disabled={processing}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Tag className="w-4 h-4" />
                    <span className="hidden sm:inline">Recategorize</span>
                  </button>
                )}
              </div>

              {!showRecategorize && (
                <>
                  <button
                    onClick={() => setShowConfirmCancel(true)}
                    disabled={processing}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Cancel Selected</span>
                  </button>

                  <div className="w-px h-6 bg-white/10 mx-1"></div>

                  <button
                    onClick={onClearSelection}
                    disabled={processing}
                    className="p-2 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
                    title="Clear Selection"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showConfirmCancel && (
        <ConfirmDialog
          isOpen={showConfirmCancel}
          title="Cancel Subscriptions"
          message={`Are you sure you want to cancel ${selectedCount} subscriptions? This will mark them as cancelled and they won't appear in active totals, but their history will be retained.`}
          confirmLabel="Yes, Cancel Them"
          onConfirm={handleConfirmCancel}
          onCancel={() => setShowConfirmCancel(false)}
        />
      )}
    </>
  );
};

export default BulkActionsBar;
