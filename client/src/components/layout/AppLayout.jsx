import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../../services/analyticsService';
import NotificationBell from '../dashboard/NotificationBell';
import NotificationPanel from '../dashboard/NotificationPanel';

const AppLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const data = await getNotifications();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleMarkRead = async (id) => {
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
    try {
      await markNotificationRead(id);
    } catch (err) {
      fetchNotifications();
    }
  };

  const handleMarkAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
    try {
      await markAllNotificationsRead();
    } catch (err) {
      fetchNotifications();
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0 flex items-center space-x-2">
              <Link to="/" className="text-xl font-bold text-primary-600">SubTrack</Link>
              <span className="bg-primary-100 text-primary-700 text-xs font-semibold px-2 py-0.5 rounded">v1.0.1</span>
            </div>
            
            <nav className="flex items-center space-x-6">
              <Link to="/" className="text-gray-600 hover:text-primary-600 font-medium">Dashboard</Link>
              <Link to="/subscriptions" className="text-gray-600 hover:text-primary-600 font-medium">Subscriptions</Link>
              
              <div className="flex items-center space-x-4 border-l border-gray-200 pl-6 ml-2">
                {user ? (
                  <>
                    <div className="relative">
                      <NotificationBell 
                        unreadCount={unreadCount} 
                        onClick={() => setIsPanelOpen(!isPanelOpen)} 
                      />
                      
                      {isPanelOpen && (
                        <>
                          <div 
                            className="fixed inset-0 z-40"
                            onClick={() => setIsPanelOpen(false)}
                          ></div>
                          <div className="absolute right-0 mt-2 z-50 w-80">
                            <NotificationPanel 
                              notifications={notifications}
                              onMarkRead={handleMarkRead}
                              onMarkAllRead={handleMarkAllRead}
                              loading={notifLoading}
                            />
                          </div>
                        </>
                      )}
                    </div>
                    <span className="text-sm text-gray-700">Hi, {user.name}</span>
                    <button 
                      onClick={handleLogout}
                      className="text-sm text-gray-500 hover:text-primary-600 transition"
                    >
                      Log out
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="text-sm text-gray-500 hover:text-primary-600">Login</Link>
                    <Link to="/register" className="text-sm bg-primary-50 text-primary-600 px-3 py-1.5 rounded hover:bg-primary-100 transition">Register</Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
