import React from 'react';
import { formatCurrency } from '../../utils/formatters';
import { motion } from 'framer-motion';

const SpendingVelocityCard = ({ velocity }) => {
  if (!velocity) return null;

  const {
    projectedMonthEnd,
    daysElapsed,
    daysRemaining,
    lastMonthActual,
    percentChangeVsLastMonth,
    trend,
    currency
  } = velocity;

  const totalDays = daysElapsed + daysRemaining;
  const progressPercent = (daysElapsed / totalDays) * 100;

  let trendColorClass = 'text-brand-text/70';
  let gradientClass = 'from-white/10 to-white/5';

  if (trend === 'up') {
    trendColorClass = 'text-accent';
    gradientClass = 'from-accent/20 to-white/5';
  } else if (trend === 'down') {
    trendColorClass = 'text-green-400';
    gradientClass = 'from-green-500/20 to-white/5';
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`w-full rounded-2xl shadow-sm border border-white/10 backdrop-blur-xl p-6 mb-8 bg-gradient-to-br ${gradientClass}`}
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-3xl md:text-4xl font-bold text-brand-text tracking-tight mb-2">
            You're on track to spend <span className="text-primary">{formatCurrency(projectedMonthEnd, currency)}</span> this month
          </h2>
          
          <div className={`text-sm font-medium ${trendColorClass}`}>
            {percentChangeVsLastMonth !== null ? (
              <span>
                {Math.abs(percentChangeVsLastMonth)}% {trend === 'up' ? 'more' : trend === 'down' ? 'less' : 'about the same as'} than last month ({formatCurrency(lastMonthActual, currency)})
              </span>
            ) : (
              <span className="text-brand-text/70">Not enough history yet to compare to last month</span>
            )}
          </div>
        </div>

        <div className="w-full md:w-48 shrink-0">
          <div className="flex justify-between text-xs text-brand-text/70 mb-1.5 font-medium">
            <span>{daysElapsed} days elapsed</span>
            <span>{totalDays} days total</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-1000 ease-out" 
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SpendingVelocityCard;
