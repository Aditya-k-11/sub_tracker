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
        className="bg-white/5 backdrop-blur-md rounded-2xl shadow-xl p-10 border border-white/10 flex flex-col items-center text-center"
      >
        <CheckCircle2 size={36} className="text-accent mb-3" />
        <h3 className="text-lg font-medium text-brand-text mb-1">Nothing flagged</h3>
        <p className="text-brand-text/70 text-sm">You're using everything you pay for.</p>
      </motion.div>
    );
  }

  return (
    <motion.div whileHover={{ y: -4 }} className="bg-white/5 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden border border-white/10">
      <div className="bg-secondary/20 p-6 border-b border-secondary/30 flex items-center justify-between">
        <div>
          <h3 className="text-xs uppercase tracking-wide text-secondary font-bold mb-1">Potential Wasted Spend</h3>
          <div className="text-2xl sm:text-3xl font-bold text-brand-text flex items-center tracking-tight">
            <AlertCircle className="mr-3 text-secondary" size={28} />
            {formatCurrency(potentialSavings, user?.currency)} <span className="text-sm font-normal text-secondary ml-2 mt-1">/ month</span>
          </div>
        </div>
      </div>
      
      <div className="divide-y divide-white/10">
        <AnimatePresence>
        {flagged.map((sub, index) => (
          <motion.div 
            key={sub.subscriptionId} 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: 100, transition: { duration: 0.3 } }}
            transition={{ delay: index * 0.05 }}
            className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 transition hover:bg-white/10"
          >
            <div>
              <div className="flex items-center space-x-3 mb-1.5">
                <span className="font-semibold text-brand-text">{sub.name}</span>
                <span className="px-2.5 py-0.5 bg-white/10 text-brand-text/80 text-xs font-medium rounded-full">{sub.category}</span>
              </div>
              <p className="text-sm text-brand-text/70 mb-1.5">{sub.reason}</p>
              <p className="text-xs font-medium text-brand-text/50">
                Cost per use: {sub.costPerUse !== null ? `${formatCurrency(sub.costPerUse, user?.currency)}/use` : 'Never used'}
              </p>
            </div>
            
            <div className="flex items-center justify-between md:justify-end space-x-6">
              <div className="text-left md:text-right">
                <div className="font-bold text-brand-text tabular-nums">{formatCurrency(sub.monthlyCost, user?.currency)}</div>
                <div className="text-xs text-brand-text/70">per month</div>
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
