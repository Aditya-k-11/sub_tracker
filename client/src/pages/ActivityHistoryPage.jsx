import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PageTransition from '../components/common/PageTransition';
import ActivityFilters from '../components/activity/ActivityFilters';
import { getActivityHistory } from '../services/activityService';
import { formatActivityText, getActivityIcon, formatRelativeTime } from '../utils/activityFormatters';

const ActivityHistoryPage = () => {
  const [filters, setFilters] = useState({ action: '', startDate: '', endDate: '', page: 1 });
  const [activityData, setActivityData] = useState({ activities: [], totalPages: 0, totalCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getActivityHistory(filters);
        setActivityData(data);
      } catch (err) {
        console.error('Failed to fetch activity history', err);
        setError('Failed to load activity history. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [filters]);

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
    show: { opacity: 1, x: 0 }
  };

  return (
    <PageTransition className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      <div className="mb-6 animate-fade-in-up">
        <h1 className="text-3xl font-bold text-brand-text tracking-tight mb-2">Activity History</h1>
        <p className="text-brand-text/70">View all your actions and changes across SubTrack.</p>
      </div>

      <div className="animate-fade-in-up" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
        <ActivityFilters currentFilters={filters} onChange={setFilters} />
      </div>

      <div className="animate-fade-in-up" style={{ animationDelay: '150ms', animationFillMode: 'both' }}>
        {error ? (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-2xl text-center shadow-xl backdrop-blur-md">
            <p>{error}</p>
          </div>
        ) : loading && activityData.activities.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        ) : activityData.activities.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-md rounded-2xl shadow-xl border border-white/10 p-12 text-center flex flex-col items-center">
            <div className="bg-brand-bg rounded-full p-4 mb-4">
              <svg className="w-8 h-8 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No activity found</h3>
            <p className="text-white/50 max-w-md">Try adjusting your filters or check back after making some changes.</p>
          </div>
        ) : (
          <div className="bg-white/5 backdrop-blur-md rounded-2xl shadow-xl border border-white/10 overflow-hidden">
            <motion.div 
              variants={containerVariants} 
              initial="hidden" 
              animate="show" 
              className="p-6 sm:p-8 relative"
            >
              {/* Central vertical timeline line */}
              <div className="absolute left-[44px] sm:left-[52px] top-10 bottom-10 w-[2px] bg-white/5 hidden sm:block"></div>
              
              <div className="space-y-8">
                {activityData.activities.map((activity) => (
                  <motion.div 
                    key={activity._id} 
                    variants={itemVariants}
                    className="flex flex-col sm:flex-row gap-4 sm:items-start group"
                  >
                    <div className="hidden sm:flex flex-col items-center min-w-[100px] pt-1">
                      <p className="text-xs font-medium text-white/50 whitespace-nowrap">
                        {formatRelativeTime(activity.createdAt)}
                      </p>
                    </div>
                    
                    <div className="relative z-10 bg-brand-bg rounded-full p-1 border-4 border-transparent group-hover:border-white/5 transition-colors hidden sm:block">
                      {getActivityIcon(activity.action)}
                    </div>
                    
                    {/* Mobile layout */}
                    <div className="flex items-center gap-3 sm:hidden mb-2">
                       <div className="bg-brand-bg rounded-full p-1">
                          {getActivityIcon(activity.action)}
                       </div>
                       <p className="text-xs font-medium text-white/50">
                          {formatRelativeTime(activity.createdAt)}
                       </p>
                    </div>

                    <div className="flex-1 bg-white/5 border border-white/10 rounded-xl p-4 group-hover:bg-white/10 transition-colors">
                      <p className="text-sm font-medium text-white leading-relaxed">
                        {formatActivityText(activity)}
                      </p>
                      {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                        <div className="mt-3 pt-3 border-t border-white/10">
                          <pre className="text-xs text-white/60 font-mono overflow-x-auto whitespace-pre-wrap">
                            {JSON.stringify(activity.metadata, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            {activityData.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-white/10 bg-black/20 flex items-center justify-between">
                <button
                  disabled={filters.page === 1}
                  onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                  className="px-4 py-2 text-sm font-medium text-white bg-white/5 hover:bg-white/10 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <span className="text-sm text-white/50 font-medium">
                  Page {filters.page} of {activityData.totalPages}
                </span>
                <button
                  disabled={filters.page === activityData.totalPages}
                  onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                  className="px-4 py-2 text-sm font-medium text-white bg-white/5 hover:bg-white/10 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default ActivityHistoryPage;
