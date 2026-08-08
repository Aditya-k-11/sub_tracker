import React from 'react';
import { formatDate } from '../../utils/formatters';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../common/Button';

const NotificationPanel = ({ notifications, onMarkRead, onMarkAllRead, loading }) => {
  const unreadCount = notifications ? notifications.filter(n => !n.isRead).length : 0;

  return (
    <div className="w-80 sm:w-96 bg-white/90 rounded-2xl shadow-xl shadow-primary-900/5 border border-white/40 overflow-hidden flex flex-col max-h-[80vh]">
      <div className="px-4 py-3 border-b border-gray-100/50 flex justify-between items-center bg-gray-50/30">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Notifications</h3>
        {unreadCount > 0 && (
          <Button 
            variant="ghost"
            size="sm"
            onClick={onMarkAllRead}
            className="text-primary-600 !p-1 !h-auto text-xs"
          >
            Mark all read
          </Button>
        )}
      </div>

      <div className="overflow-y-auto flex-grow">
        {loading && (!notifications || notifications.length === 0) ? (
          <div className="p-8 text-center text-sm text-gray-400">Loading...</div>
        ) : !notifications || notifications.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm font-medium text-gray-900 mb-1">No renewal alerts right now</p>
            <p className="text-xs text-gray-500">You're all caught up</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50/50">
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
                      ? 'bg-white/40 opacity-70' 
                      : 'bg-primary-50/30 cursor-pointer hover:bg-white/60'
                  }`}
                >
                  <div className="flex-shrink-0 mt-1">
                    <span className={`inline-block w-2.5 h-2.5 rounded-full ${
                      notification.priority === 'high' ? 'bg-warning-500' : 'bg-primary-500'
                    }`}></span>
                  </div>
                  <div className="flex-grow">
                    <p className={`text-sm ${notification.isRead ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1.5">
                      {formatDate(notification.sentAt)}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <div className="flex-shrink-0 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-primary-500"></div>
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
