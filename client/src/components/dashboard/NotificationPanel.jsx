import React from 'react';
import { formatDate } from '../../utils/formatters';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../common/Button';

const NotificationPanel = ({ notifications, onMarkRead, onMarkAllRead, loading }) => {
  const unreadCount = notifications ? notifications.filter(n => !n.isRead).length : 0;

  return (
    <div className="w-80 sm:w-96 bg-gradient-to-br from-brand-bg/95 via-primary/20 to-brand-bg/95 bg-[length:200%_200%] animate-gradient-shift backdrop-blur-xl rounded-2xl shadow-xl shadow-primary/5 border border-white/10 overflow-hidden flex flex-col max-h-[80vh]">
      <div className="px-4 py-3 border-b border-white/10 flex justify-between items-center bg-white/5">
        <h3 className="text-xs font-semibold text-brand-text/70 uppercase tracking-wide">Notifications</h3>
        {unreadCount > 0 && (
          <Button 
            variant="ghost"
            size="sm"
            onClick={onMarkAllRead}
            className="text-primary hover:text-primary/80 !p-1 !h-auto text-xs"
          >
            Mark all read
          </Button>
        )}
      </div>

      <div className="overflow-y-auto flex-grow">
        {loading && (!notifications || notifications.length === 0) ? (
          <div className="p-8 text-center text-sm text-brand-text/50">Loading...</div>
        ) : !notifications || notifications.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm font-medium text-brand-text mb-1">No renewal alerts right now</p>
            <p className="text-xs text-brand-text/50">You're all caught up</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            <AnimatePresence>
              {notifications.map((notification, index) => (
                <motion.div 
                  key={notification._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => !notification.isRead && onMarkRead(notification._id)}
                  className={`p-4 flex gap-3 transition ${
                    notification.isRead 
                      ? 'opacity-60 hover:bg-white/5' 
                      : 'bg-white/10 cursor-pointer hover:bg-white/20'
                  }`}
                >
                  <div className="flex-shrink-0 mt-1">
                    <span className={`inline-block w-2.5 h-2.5 rounded-full ${
                      notification.priority === 'high' ? 'bg-secondary' : 'bg-primary'
                    }`}></span>
                  </div>
                  <div className="flex-grow">
                    <p className={`text-sm ${notification.isRead ? 'text-brand-text/70' : 'text-brand-text font-medium'}`}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-brand-text/50 mt-1.5">
                      {formatDate(notification.sentAt)}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <div className="flex-shrink-0 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(250,130,250,0.8)]"></div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;
