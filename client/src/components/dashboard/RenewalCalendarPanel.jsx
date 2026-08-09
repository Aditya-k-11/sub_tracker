import React from 'react';
import NotificationPanel from './NotificationPanel';
import EmptyState from '../common/EmptyState';
import { CalendarClock } from 'lucide-react';
import { motion } from 'framer-motion';

const RenewalCalendarPanel = ({ notifications }) => {

  if (!notifications || notifications.length === 0) {
    return (
      <motion.div whileHover={{ y: -4 }} className="bg-white/5 backdrop-blur-md rounded-2xl shadow-xl border border-white/10 p-8 h-full flex flex-col items-center justify-center text-center">
        <CalendarClock size={32} className="text-accent mb-3" />
        <h3 className="text-lg font-medium text-brand-text mb-1">Nothing renewing soon</h3>
        <p className="text-sm text-brand-text/70">You're all caught up on your subscriptions.</p>
      </motion.div>
    );
  }

  return (
    <motion.div whileHover={{ y: -4 }} className="bg-white/5 backdrop-blur-md rounded-2xl shadow-xl border border-white/10 flex flex-col h-full overflow-hidden">
      <div className="px-6 py-5 border-b border-white/10 bg-white/5">
        <h3 className="text-xs uppercase tracking-wide text-brand-text/70 font-semibold flex items-center">
          <CalendarClock size={16} className="text-accent mr-2" />
          Upcoming Renewals & Trials
        </h3>
      </div>
      
      <div className="flex-grow overflow-y-auto">
        <div className="divide-y divide-white/10">
          {notifications.map(notification => (
            <div 
              key={notification._id}
              className={`p-6 flex gap-4 transition ${
                notification.isRead 
                  ? 'bg-transparent' 
                  : 'bg-white/10'
              }`}
            >
              <div className="flex-shrink-0 mt-1">
                <span className={`inline-block w-3 h-3 rounded-full shadow-sm ${
                  notification.priority === 'high' ? 'bg-secondary' : 'bg-primary'
                }`}></span>
              </div>
              <div className="flex-grow">
                <p className={`text-base ${notification.isRead ? 'text-brand-text/70' : 'text-brand-text font-medium'}`}>
                  {notification.message}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    notification.priority === 'high' ? 'bg-secondary/20 text-secondary' : 'bg-primary/20 text-primary'
                  }`}>
                    {notification.priority === 'high' ? 'Trial Ending' : 'Renewal'}
                  </span>
                  {!notification.isRead && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-accent">New</span>
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
