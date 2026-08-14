import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { formatActivityText, getActivityIcon, formatRelativeTime } from '../../utils/activityFormatters';

const ActivityFeedWidget = ({ activities = [] }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0 }
  };

  return (
    <motion.div 
      whileHover={{ y: -4 }} 
      className="bg-white/5 backdrop-blur-md rounded-2xl shadow-xl border border-white/10 flex flex-col h-full"
    >
      <div className="px-6 py-5 border-b border-white/10 bg-white/5 flex justify-between items-center">
        <h3 className="text-lg font-bold text-white">Recent Activity</h3>
      </div>
      
      <div className="p-6 flex-1 overflow-y-auto">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-white/50 text-center py-8">
            <p className="text-sm">No activity yet</p>
            <p className="text-xs mt-1">Start by adding a subscription</p>
          </div>
        ) : (
          <motion.div 
            variants={containerVariants} 
            initial="hidden" 
            animate="show" 
            className="space-y-6"
          >
            {activities.map((activity, index) => (
              <motion.div 
                key={activity._id || index} 
                variants={itemVariants}
                className="flex items-start gap-4 relative"
              >
                {/* Timeline connector */}
                {index !== activities.length - 1 && (
                  <div className="absolute left-[11px] top-6 bottom-[-24px] w-[2px] bg-white/5"></div>
                )}
                
                <div className="relative z-10 bg-brand-bg rounded-full p-0.5">
                  {getActivityIcon(activity.action)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white/90 leading-tight">
                    {formatActivityText(activity)}
                  </p>
                  <p className="text-xs text-white/50 mt-1">
                    {formatRelativeTime(activity.createdAt)}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      <div className="px-6 py-3 border-t border-white/10 bg-white/5 flex justify-center mt-auto">
        <Link 
          to="/activity" 
          className="text-sm text-primary-400 hover:text-primary-300 font-medium transition-colors"
        >
          View all history &rarr;
        </Link>
      </div>
    </motion.div>
  );
};

export default ActivityFeedWidget;
