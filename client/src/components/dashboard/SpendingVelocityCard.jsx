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
    trend
  } = velocity;

  const totalDays = daysElapsed + daysRemaining;
  const progressPercent = (daysElapsed / totalDays) * 100;

  let trendColorClass = 'text-gray-500';
  let gradientClass = 'from-white/80 to-white/60';

  if (trend === 'up') {
    trendColorClass = 'text-amber-600';
    gradientClass = 'from-amber-50/80 to-white/60';
  } else if (trend === 'down') {
    trendColorClass = 'text-green-600';
    gradientClass = 'from-green-50/80 to-white/60';
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`w-full rounded-2xl shadow-sm border border-white/50 backdrop-blur-xl p-6 mb-8 bg-gradient-to-br ${gradientClass}`}
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-2">
            You're on track to spend <span className="text-indigo-600">{formatCurrency(projectedMonthEnd)}</span> this month
          </h2>
          
          <div className={`text-sm font-medium ${trendColorClass}`}>
            {percentChangeVsLastMonth !== null ? (
              <span>
                {Math.abs(percentChangeVsLastMonth)}% {trend === 'up' ? 'more' : trend === 'down' ? 'less' : 'about the same as'} than last month ({formatCurrency(lastMonthActual)})
              </span>
            ) : (
              <span className="text-gray-500">Not enough history yet to compare to last month</span>
            )}
          </div>
        </div>

        <div className="w-full md:w-48 shrink-0">
          <div className="flex justify-between text-xs text-gray-500 mb-1.5 font-medium">
            <span>{daysElapsed} days elapsed</span>
            <span>{totalDays} days total</span>
          </div>
          <div className="w-full bg-gray-200/50 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-indigo-500 h-2 rounded-full transition-all duration-1000 ease-out" 
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SpendingVelocityCard;
