import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import AnimatedBackground from '../common/AnimatedBackground';
import { useAuth } from '../../context/AuthContext';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../../services/analyticsService';
import NotificationBell from '../dashboard/NotificationBell';
import NotificationPanel from '../dashboard/NotificationPanel';
import Button from '../common/Button';
import CommandBar from '../common/CommandBar';
import { useCommandBar } from '../../context/CommandBarContext';
import { Search } from 'lucide-react';

const AppLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  const { open: openCommandBar } = useCommandBar();

  const navLinks = [
    { path: '/', label: 'Dashboard' },
    { path: '/subscriptions', label: 'Subscriptions' },
    { path: '/settings', label: 'Settings' }
  ];

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
    <div className="min-h-screen bg-transparent relative">
      <AnimatedBackground />
      <header className="bg-brand-bg/95 border-b border-white/10 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0 flex items-center space-x-2">
              <Link to="/" className="text-xl font-bold text-accent">SubTrack</Link>
              <span className="bg-primary/20 text-primary text-xs font-semibold px-2 py-0.5 rounded">v1.0.1</span>
            </div>
            
            <nav className="flex items-center space-x-6 relative">
              {navLinks.map((link) => (
                <Link 
                  key={link.path}
                  to={link.path} 
                  className={`relative px-3 py-2 text-sm font-medium transition-colors ${location.pathname === link.path ? 'text-primary' : 'text-brand-text/70 hover:text-brand-text'}`}
                >
                  {link.label}
                  {location.pathname === link.path && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </Link>
              ))}
              
              <div className="flex items-center space-x-4 border-l border-white/20 pl-6 ml-2">
                {user && (
                  <button
                    onClick={openCommandBar}
                    className="flex items-center space-x-1.5 text-gray-400 hover:text-white transition-colors p-1"
                    aria-label="Open command bar"
                  >
                    <Search className="h-5 w-5" />
                    <span className="hidden sm:inline-block text-xs font-mono border border-gray-600 rounded px-1.5 py-0.5">⌘K</span>
                  </button>
                )}
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
                    <span className="text-sm text-brand-text">Hi, {user.name}</span>
                    <Button 
                      variant="ghost"
                      size="sm"
                      onClick={handleLogout}
                    >
                      Log out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="text-sm text-brand-text/70 hover:text-primary">Login</Link>
                    <Link to="/register" className="text-sm bg-primary/20 text-primary px-3 py-1.5 rounded hover:bg-primary/30 transition">Register</Link>
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

      {/* Render CommandBar once at root level */}
      <CommandBar />
    </div>
  );
};

export default AppLayout;
