import React, { useState, useEffect } from 'react';
import PageTransition from '../components/common/PageTransition';
import { getGmailStatus, initiateGmailConnect, disconnectGmail } from '../services/googleAuthService';
import { triggerEmailScan, getSuggestions, confirmSuggestion, dismissSuggestion } from '../services/suggestionService';
import { formatDate } from '../utils/formatters';
import Badge from '../components/common/Badge';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Toast from '../components/common/Toast';
import EmptyState from '../components/common/EmptyState';
import ScanningState from '../components/settings/ScanningState';
import SuggestionCard from '../components/settings/SuggestionCard';
import Button from '../components/common/Button';
import { motion, AnimatePresence } from 'framer-motion';

const SettingsPage = () => {
  const [gmailStatus, setGmailStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(true);
  
  const [suggestions, setSuggestions] = useState([]);
  const [scanning, setScanning] = useState(false);
  
  const [toast, setToast] = useState(null);
  const [isDisconnectOpen, setIsDisconnectOpen] = useState(false);

  useEffect(() => {
    fetchStatus();

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('gmail') === 'connected') {
      showToast('success', 'Gmail connected successfully!');
      
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const fetchStatus = async () => {
    try {
      const status = await getGmailStatus();
      setGmailStatus(status);
      if (status.connected) {
        fetchSuggestions();
      }
    } catch (err) {
      console.error('Failed to fetch Gmail status', err);
      setGmailStatus({ connected: false });
    } finally {
      setStatusLoading(false);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const data = await getSuggestions();
      setSuggestions(data.suggestions);
    } catch (err) {
      console.error('Failed to fetch suggestions', err);
    }
  };

  const handleConnect = async () => {
    try {
      const { authUrl } = await initiateGmailConnect();
      window.location.href = authUrl; 
    } catch (err) {
      showToast('error', 'Failed to initiate connection');
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectGmail();
      setGmailStatus({ connected: false });
      setSuggestions([]); 
      showToast('success', 'Gmail disconnected');
      setIsDisconnectOpen(false);
    } catch (err) {
      showToast('error', 'Failed to disconnect Gmail');
    }
  };

  const handleScan = async () => {
    setScanning(true);
    try {
      const result = await triggerEmailScan();
      if (result.newSuggestions > 0) {
        showToast('success', `Found ${result.newSuggestions} new suggestions!`);
      } else {
        showToast('success', 'No new subscriptions found.');
      }
      await fetchSuggestions();
    } catch (err) {
      showToast('error', 'Failed to scan inbox');
    } finally {
      setScanning(false);
    }
  };

  const handleConfirm = async (id, overrides) => {
    try {
      await confirmSuggestion(id, overrides);
      setSuggestions(prev => prev.filter(s => s._id !== id));
      showToast('success', 'Added to your subscriptions');
    } catch (err) {
      
      showToast('error', err.response?.data?.message || 'Failed to confirm suggestion');
    }
  };

  const handleDismiss = async (id) => {
    try {
      await dismissSuggestion(id);
      setSuggestions(prev => prev.filter(s => s._id !== id));
      showToast('success', 'Suggestion dismissed');
    } catch (err) {
      showToast('error', 'Failed to dismiss suggestion');
    }
  };

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  if (statusLoading) return null;

  return (
    <PageTransition className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      </div>

      <section>
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Email Subscription Detection</h2>
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          {!gmailStatus?.connected ? (
            <div className="space-y-4">
              <p className="text-gray-600">
                Connect Gmail to automatically find subscriptions from your inbox — SubTrack only requests read-only access and never sends or modifies anything.
              </p>
              <Button
                onClick={handleConnect}
              >
                Connect Gmail
              </Button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-3 mb-1">
                  <Badge text="Connected" variant="connected" />
                  <span className="text-sm font-medium text-gray-900">{gmailStatus.email}</span>
                </div>
                <p className="text-sm text-gray-500">Connected on {formatDate(gmailStatus.connectedAt)}</p>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  variant="secondary"
                  onClick={() => setIsDisconnectOpen(true)}
                >
                  Disconnect
                </Button>
                <Button
                  onClick={handleScan}
                  loading={scanning}
                >
                  Scan Email Now
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {gmailStatus?.connected && (
        <section>
          {scanning ? (
            <ScanningState />
          ) : suggestions.length > 0 ? (
            <div className="space-y-4">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Suggested Subscriptions</h2>
              <AnimatePresence>
              {suggestions.map((suggestion, index) => (
                <motion.div
                  key={suggestion._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <SuggestionCard 
                    suggestion={suggestion}
                    onConfirm={handleConfirm}
                    onDismiss={handleDismiss}
                  />
                </motion.div>
              ))}
              </AnimatePresence>
            </div>
          ) : (
            <EmptyState 
              title="No pending suggestions"
              description="Click 'Scan Email Now' to check your inbox for new subscriptions."
            />
          )}
        </section>
      )}

      <ConfirmDialog
        isOpen={isDisconnectOpen}
        title="Disconnect Gmail"
        message="Are you sure you want to disconnect your Gmail account? SubTrack will no longer be able to find new subscriptions."
        confirmText="Disconnect"
        onConfirm={handleDisconnect}
        onCancel={() => setIsDisconnectOpen(false)}
        isDestructive={true}
      />
    </PageTransition>
  );
};

export default SettingsPage;
