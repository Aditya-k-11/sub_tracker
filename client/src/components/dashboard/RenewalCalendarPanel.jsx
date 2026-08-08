import React from 'react';
import NotificationPanel from './NotificationPanel';
import EmptyState from '../common/EmptyState';
import { CalendarClock } from 'lucide-react';
import { motion } from 'framer-motion';

const RenewalCalendarPanel = ({ notifications }) => {

  if (!notifications || notifications.length === 0) {
    return (
      <motion.div whileHover={{ y: -4 }} className="bg-white/90 rounded-2xl shadow-xl shadow-primary-900/5 border border-white/40 p-8 h-full flex flex-col items-center justify-center text-center">
        <CalendarClock size={32} className="text-gray-300 mb-3" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">Nothing renewing soon</h3>
        <p className="text-sm text-gray-500">You're all caught up on your subscriptions.</p>
      </motion.div>
    );
  }

  return (
    <motion.div whileHover={{ y: -4 }} className="bg-white/90 rounded-2xl shadow-xl shadow-primary-900/5 border border-white/40 flex flex-col h-full overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100/50 bg-gray-50/30">
        <h3 className="text-xs uppercase tracking-wide text-gray-500 font-semibold flex items-center">
          <CalendarClock size={16} className="mr-2" />
          Upcoming Renewals & Trials
        </h3>
      </div>
      
      <div className="flex-grow overflow-y-auto">
        <div className="divide-y divide-gray-50">
          {notifications.map(notification => (
            <div 
              key={notification._id}
              className={`p-6 flex gap-4 transition ${
                notification.isRead 
                  ? 'bg-white' 
                  : 'bg-primary-50/20'
              }`}
            >
              <div className="flex-shrink-0 mt-1">
                <span className={`inline-block w-3 h-3 rounded-full shadow-sm ${
                  notification.priority === 'high' ? 'bg-warning-500' : 'bg-primary-500'
                }`}></span>
              </div>
              <div className="flex-grow">
                <p className={`text-base ${notification.isRead ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                  {notification.message}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    notification.priority === 'high' ? 'bg-warning-100 text-warning-700' : 'bg-primary-50 text-primary-700'
                  }`}>
                    {notification.priority === 'high' ? 'Trial Ending' : 'Renewal'}
                  </span>
                  {!notification.isRead && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary-500">New</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default React.memo(RenewalCalendarPanel);
