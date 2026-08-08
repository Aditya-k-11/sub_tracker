import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatters';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../common/Button';
import LogUsageModal from '../subscriptions/LogUsageModal';

const WastedSpendPanel = ({ flagged, potentialSavings, onUsageLogged, submittingUsage }) => {
  const { user } = useAuth();
  const [usageTarget, setUsageTarget] = useState(null);

  if (!flagged || flagged.length === 0) {
    return (
      <motion.div 
        whileHover={{ y: -4 }}
        className="bg-white/90 rounded-2xl shadow-xl shadow-primary-900/5 p-10 border border-white/40 flex flex-col items-center text-center"
      >
        <CheckCircle2 size={36} className="text-accent-500 mb-3" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">Nothing flagged</h3>
        <p className="text-gray-500 text-sm">You're using everything you pay for.</p>
      </motion.div>
    );
  }

  return (
    <motion.div whileHover={{ y: -4 }} className="bg-white/90 rounded-2xl shadow-xl shadow-primary-900/5 overflow-hidden border border-white/40">
      <div className="bg-warning-50 p-6 border-b border-warning-100 flex items-center justify-between">
        <div>
          <h3 className="text-xs uppercase tracking-wide text-warning-700 font-bold mb-1">Potential Wasted Spend</h3>
          <div className="text-2xl sm:text-3xl font-bold text-warning-900 flex items-center tracking-tight">
            <AlertCircle className="mr-3 text-warning-600" size={28} />
            {formatCurrency(potentialSavings, user?.currency)} <span className="text-sm font-normal text-warning-700 ml-2 mt-1">/ month</span>
          </div>
        </div>
      </div>
      
      <div className="divide-y divide-gray-100/50">
        <AnimatePresence>
        {flagged.map((sub, index) => (
          <motion.div 
            key={sub.subscriptionId} 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: 100, transition: { duration: 0.3 } }}
            transition={{ delay: index * 0.05 }}
            className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 transition hover:bg-white/50"
          >
            <div>
              <div className="flex items-center space-x-3 mb-1.5">
                <span className="font-semibold text-gray-900">{sub.name}</span>
                <span className="px-2.5 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">{sub.category}</span>
              </div>
              <p className="text-sm text-gray-500 mb-1.5">{sub.reason}</p>
              <p className="text-xs font-medium text-gray-400">
                Cost per use: {sub.costPerUse !== null ? `${formatCurrency(sub.costPerUse, user?.currency)}/use` : 'Never used'}
              </p>
            </div>
            
            <div className="flex items-center justify-between md:justify-end space-x-6">
              <div className="text-left md:text-right">
                <div className="font-bold text-gray-900 tabular-nums">{formatCurrency(sub.monthlyCost, user?.currency)}</div>
                <div className="text-xs text-gray-500">per month</div>
              </div>
              <Button 
                variant="secondary"
                size="sm"
                onClick={() => setUsageTarget(sub)}
              >
                Log usage
              </Button>
            </div>
          </motion.div>
        ))}
        </AnimatePresence>
      </div>

      <LogUsageModal
        isOpen={!!usageTarget}
        onClose={() => setUsageTarget(null)}
        subscription={usageTarget ? { _id: usageTarget.subscriptionId, name: usageTarget.name } : null}
        onSubmit={async (note) => {
          await onUsageLogged(usageTarget.subscriptionId, note);
          setUsageTarget(null);
        }}
        submitting={submittingUsage}
      />
    </motion.div>
  );
};

export default React.memo(WastedSpendPanel);
