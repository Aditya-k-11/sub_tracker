import React from 'react';
import { motion } from 'framer-motion';
import { formatCurrency } from '../../utils/formatters';

const PaymentsTimeline = ({ days }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  if (!days || days.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-brand-text mb-4 px-1">Upcoming Payments Timeline</h2>
      <motion.div 
        className="flex overflow-x-auto pb-4 gap-4 snap-x snap-mandatory hide-scrollbar"
        variants={containerVariants}
        initial="hidden"
        animate="show"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {days.map((day, index) => {
          const isTodayOrTomorrow = day.dayLabel === 'Today' || day.dayLabel === 'Tomorrow';
          const isEmpty = day.subscriptions.length === 0;

          return (
            <motion.div 
              key={day.date}
              variants={itemVariants}
              className="snap-start shrink-0 w-40 flex flex-col bg-white/5 backdrop-blur-xl rounded-2xl shadow-sm border border-white/10 hover:shadow-md transition-shadow duration-300 p-4"
            >
              <div className="mb-3 border-b border-white/10 pb-2">
                <p className={`text-sm ${isTodayOrTomorrow ? 'font-bold text-brand-text' : 'font-medium text-brand-text/70'}`}>
                  {day.dayLabel}
                </p>
                <p className="text-xs text-brand-text/50 mt-0.5">{day.date}</p>
              </div>

              <div className="flex-1 flex flex-col gap-2 mb-3">
                {isEmpty ? (
                  <div className="flex items-center justify-center h-full">
                    <span className="text-xs text-brand-text/40">No renewals</span>
                  </div>
                ) : (
                  day.subscriptions.map(sub => (
                    <div 
                      key={sub.subscriptionId} 
                      className={`text-xs px-2 py-1.5 rounded-full truncate border ${
                        sub.isTrial 
                          ? 'bg-accent/20 text-accent border-accent/30' 
                          : 'bg-primary/20 text-primary border-primary/30'
                      }`}
                      title={`${sub.name} - ${formatCurrency(sub.cost)}`}
                    >
                      {sub.name}
                    </div>
                  ))
                )}
              </div>

              <div className="mt-auto pt-2 border-t border-white/10">
                <p className="text-sm font-semibold text-brand-text">
                  {formatCurrency(day.totalCost)}
                </p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};

export default PaymentsTimeline;
