import React from 'react';
import { Bell } from 'lucide-react';

const NotificationBell = ({ unreadCount, onClick }) => {
  const displayCount = unreadCount > 9 ? '9+' : unreadCount;

  return (
    <button 
      onClick={onClick}
      className="relative p-2 text-accent hover:text-accent/80 hover:bg-white/10 rounded-full transition focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
      aria-label="View notifications"
    >
      <Bell size={20} />
      
      {unreadCount > 0 && (
        <span className="absolute top-1 right-1.5 transform translate-x-1/2 -translate-y-1/2 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white bg-red-500 rounded-full shadow-sm">
          {displayCount}
        </span>
      )}
    </button>
  );
};

export default NotificationBell;
