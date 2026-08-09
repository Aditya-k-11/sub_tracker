import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatters';
import { Layers, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const SummaryCards = ({ summary }) => {
  const { user } = useAuth();
  
  if (!summary) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        whileHover={{ y: -4 }}
        className="bg-white/5 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-white/10 flex flex-col justify-center"
      >
        <h3 className="text-xs uppercase tracking-wide text-brand-text/70 mb-2 font-medium">Monthly Spend</h3>
        <div className="text-4xl lg:text-5xl font-bold tabular-nums text-brand-text mb-1">
          {formatCurrency(summary.totalMonthlySpend, user?.currency)}
        </div>
        <p className="text-sm text-brand-text/70">
          Yearly: {formatCurrency(summary.totalYearlySpend, user?.currency)}
        </p>
      </motion.div>

      {}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        whileHover={{ y: -4 }}
        className="bg-white/5 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-white/10 relative overflow-hidden flex flex-col justify-center"
      >
        <div className="absolute top-6 right-6 bg-accent/20 p-3 rounded-full text-accent">
          <Layers size={24} />
        </div>
        <h3 className="text-xs uppercase tracking-wide text-brand-text/70 mb-2 font-medium">Active Subscriptions</h3>
        <div className="text-4xl font-bold tabular-nums text-brand-text">
          {summary.activeSubscriptionCount}
        </div>
      </motion.div>

      {}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        whileHover={{ y: -4 }}
        className="bg-white/5 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-white/10 relative overflow-hidden flex flex-col justify-center"
      >
        <div className="absolute top-6 right-6 bg-accent/20 p-3 rounded-full text-accent">
          <Sparkles size={24} />
        </div>
        <h3 className="text-xs uppercase tracking-wide text-brand-text/70 mb-2 font-medium">Active Trials</h3>
        {summary.trialCount > 0 ? (
          <div className="text-4xl font-bold tabular-nums text-brand-text">
            {summary.trialCount}
          </div>
        ) : (
          <div className="text-sm text-brand-text/70 mt-2">No active trials</div>
        )}
      </motion.div>
    </div>
  );
};

export default React.memo(SummaryCards);
