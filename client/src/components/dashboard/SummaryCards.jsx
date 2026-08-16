import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatters';
import { Layers, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const SummaryCards = ({ summary }) => {
  if (!summary) return null;

  const currency = summary.currency || 'USD';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        whileHover={{ y: -4 }}
        className="bg-white/5 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-white/10 flex flex-col justify-center relative"
      >
        <h3 className="text-xs uppercase tracking-wide text-brand-text/70 mb-2 font-medium">Monthly Spend</h3>
        <div className="text-4xl lg:text-5xl font-bold tabular-nums text-brand-text mb-1">
          {formatCurrency(summary.totalMonthlySpend, currency)}
        </div>
        <p className="text-sm text-brand-text/70">
          Yearly: {formatCurrency(summary.totalYearlySpend, currency)}
        </p>
        
        {summary.monthlyBudget && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-white/60">Budget</span>
              <span className="text-white/90 font-medium">
                {summary.budgetUsedPercentage}% of {formatCurrency(summary.monthlyBudget, currency)}
              </span>
            </div>
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${
                  summary.budgetUsedPercentage >= 100 ? 'bg-red-500' : 
                  summary.budgetUsedPercentage >= 85 ? 'bg-amber-500' : 
                  'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, summary.budgetUsedPercentage)}%` }}
              ></div>
            </div>
          </div>
        )}
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
