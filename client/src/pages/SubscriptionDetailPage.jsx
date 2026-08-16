import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Users } from 'lucide-react';
import { 
  getSubscriptionDetail, 
  updateSubscriptionNotes,
  updateSubscription,
  cancelSubscription,
  logUsage,
  getSavingsEstimate
} from '../services/subscriptionService';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, daysUntil, formatDate, billingCycleLabel } from '../utils/formatters';
import Spinner from '../components/common/Spinner';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import EmptyState from '../components/common/EmptyState';
import Modal from '../components/common/Modal';
import SubscriptionForm from '../components/subscriptions/SubscriptionForm';
import ConfirmDialog from '../components/common/ConfirmDialog';
import LogUsageModal from '../components/subscriptions/LogUsageModal';

const SubscriptionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [showSavedIndicator, setShowSavedIndicator] = useState(false);
  const notesTimeoutRef = useRef(null);
  const initialNotesRef = useRef('');

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isLogUsageModalOpen, setIsLogUsageModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [savingsEstimate, setSavingsEstimate] = useState(null);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSubscriptionDetail(id);
      setDetail(data);
      setNotes(data.subscription.notes || '');
      initialNotesRef.current = data.subscription.notes || '';
    } catch (err) {
      setError('Failed to load subscription details. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    const fetchSavings = async () => {
      if (detail && detail.subscription.billingCycle === 'monthly') {
        try {
          const res = await getSavingsEstimate(id);
          if (res.savingsEstimate) {
            setSavingsEstimate(res.savingsEstimate);
          }
        } catch (err) {
          console.error('Failed to fetch savings estimate', err);
        }
      }
    };
    fetchSavings();
  }, [detail, id]);

  const handleNotesChange = (e) => {
    const newValue = e.target.value;
    setNotes(newValue);
    
    if (notesTimeoutRef.current) {
      clearTimeout(notesTimeoutRef.current);
    }
    
    notesTimeoutRef.current = setTimeout(async () => {
      if (newValue !== initialNotesRef.current) {
        try {
          setSavingNotes(true);
          await updateSubscriptionNotes(id, newValue);
          initialNotesRef.current = newValue;
          setShowSavedIndicator(true);
          setTimeout(() => setShowSavedIndicator(false), 2000);
        } catch (err) {
          console.error('Failed to save notes', err);
        } finally {
          setSavingNotes(false);
        }
      }
    }, 1000);
  };

  const handleEditSubmit = async (data) => {
    try {
      setActionLoading(true);
      await updateSubscription(id, data);
      setIsEditModalOpen(false);
      fetchDetail();
    } catch (error) {
      console.error('Failed to update subscription', error);
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelConfirm = async () => {
    try {
      setActionLoading(true);
      await cancelSubscription(id);
      setIsCancelModalOpen(false);
      fetchDetail();
    } catch (error) {
      console.error('Failed to cancel subscription', error);
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogUsageSubmit = async (note) => {
    try {
      setActionLoading(true);
      await logUsage(id, note);
      setIsLogUsageModalOpen(false);
      fetchDetail();
    } catch (error) {
      console.error('Failed to log usage', error);
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <div className="text-red-400 text-lg">{error}</div>
        <Button onClick={fetchDetail} variant="primary">Retry</Button>
        <Button onClick={() => navigate('/subscriptions')} variant="secondary">Back to Subscriptions</Button>
      </div>
    );
  }

  if (!detail || !detail.subscription) return null;

  const { subscription, usageLogs, notifications, summary } = detail;
  const displayStatus = subscription.isTrial ? 'trial' : subscription.status;

  let renewalText = '';
  let isOverdue = false;
  if (subscription.status === 'cancelled') {
    renewalText = 'Cancelled';
  } else if (subscription.isTrial && subscription.trialEndDate) {
    const days = daysUntil(subscription.trialEndDate);
    if (days < 0) { renewalText = 'Trial expired'; isOverdue = true; }
    else { renewalText = `Trial ends in ${days} days`; }
  } else if (subscription.nextRenewalDate) {
    const days = daysUntil(subscription.nextRenewalDate);
    if (days < 0) { renewalText = 'Renewal overdue'; isOverdue = true; }
    else { renewalText = `Renews in ${days} days`; }
  } else {
    renewalText = 'No renewal date';
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariant = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const effectiveCost = subscription.cost / (subscription.sharedWithCount || 1);
  const isShared = (subscription.sharedWithCount || 1) > 1;

  // Prepare chart data
  let chartData = [];
  if (subscription.costHistory && subscription.costHistory.length > 0) {
    chartData = subscription.costHistory.map(entry => ({
      ...entry,
      dateStr: formatDate(entry.changedAt)
    }));
    // Append current cost
    chartData.push({
      cost: subscription.cost,
      billingCycle: subscription.billingCycle,
      changedAt: new Date().toISOString(),
      dateStr: 'Current'
    });
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-2 -ml-2 text-brand-text/70">
        ← Back
      </Button>
      
      {/* Header Row */}
      <motion.div 
        variants={staggerContainer} initial="hidden" animate="show"
        className="bg-white/5 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-white/10"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
          <div>
            <div className="flex items-center space-x-3 mb-1">
              <h1 className="text-3xl font-bold text-brand-text">{subscription.name}</h1>
              <Badge text={displayStatus.toUpperCase()} variant={displayStatus} />
            </div>
            <p className="text-brand-text/70">{subscription.category}</p>
          </div>
          
          <div className="flex space-x-3">
            <Button variant="secondary" onClick={() => setIsLogUsageModalOpen(true)}>
              Log Usage
            </Button>
            <Button variant="secondary" onClick={() => setIsEditModalOpen(true)}>
              Edit
            </Button>
            {subscription.status !== 'cancelled' && (
              <Button variant="danger" onClick={() => setIsCancelModalOpen(true)}>
                Cancel
              </Button>
            )}
          </div>
        </div>

        {/* Summary Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-black/20 rounded-xl mb-4">
          <div>
            <p className="text-xs text-brand-text/60 uppercase tracking-wider mb-1">Cost</p>
            {isShared ? (
              <div className="flex flex-col">
                <p className="text-lg font-medium text-brand-text flex items-center">
                  {formatCurrency(effectiveCost, subscription.currency || 'USD')} 
                  <span className="text-xs ml-2 bg-primary-900/40 text-primary-300 px-2 py-0.5 rounded-full border border-primary-500/30 flex items-center" title={subscription.sharedNote || `Split ${subscription.sharedWithCount} ways`}>
                    <Users className="w-3 h-3 mr-1" />
                    Split {subscription.sharedWithCount}
                  </span>
                </p>
                <p className="text-xs text-brand-text/50 mt-1">Full cost: {formatCurrency(subscription.cost, subscription.currency || 'USD')}</p>
                {subscription.sharedNote && (
                  <p className="text-xs text-brand-text/50 mt-1 italic break-words w-full">Note: {subscription.sharedNote}</p>
                )}
              </div>
            ) : (
              <p className="text-lg font-medium text-brand-text">{formatCurrency(subscription.cost, subscription.currency || 'USD')}</p>
            )}
          </div>
          <div>
            <p className="text-xs text-brand-text/60 uppercase tracking-wider mb-1">Billing Cycle</p>
            <p className="text-lg font-medium text-brand-text capitalize">{billingCycleLabel(subscription.billingCycle, subscription.billingCycleInterval)}</p>
          </div>
          <div>
            <p className="text-xs text-brand-text/60 uppercase tracking-wider mb-1">Next Event</p>
            <p className={`text-lg font-medium ${isOverdue ? 'text-secondary' : 'text-brand-text'}`}>{renewalText}</p>
          </div>
          <div>
            <p className="text-xs text-brand-text/60 uppercase tracking-wider mb-1">Days Since Last Use</p>
            <p className="text-lg font-medium text-brand-text">{summary.daysSinceLastUse !== null ? summary.daysSinceLastUse : 'Never'}</p>
          </div>
        </div>

        {summary.isCurrentlyFlaggedWasted && (
          <div className="bg-amber-500/20 border border-amber-500/50 rounded-xl p-4 flex items-center space-x-3 text-amber-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="font-medium">Currently flagged as likely wasted spend</span>
          </div>
        )}

        {savingsEstimate && savingsEstimate.estimatedSavings > 0 && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 mt-4 flex items-start space-x-3 text-emerald-100">
            <div className="mt-0.5">💡</div>
            <div>
              <p className="font-medium">
                {savingsEstimate.isEstimate 
                  ? `Similar services typically save around ${savingsEstimate.discountPercent}% with annual billing.` 
                  : `Switching to yearly could save you ${formatCurrency(savingsEstimate.estimatedSavings, subscription.currency || 'USD')}/year.`}
              </p>
              {savingsEstimate.isEstimate && (
                <p className="text-sm opacity-80 mt-1">
                  Check if {subscription.name} offers an annual plan to save approximately {formatCurrency(savingsEstimate.estimatedSavings, subscription.currency || 'USD')}/year.
                </p>
              )}
            </div>
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariant} className="space-y-6">
          {/* Notes Section */}
          <div className="bg-white/5 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-white/10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-brand-text">Notes</h2>
              <div className="h-5">
                {savingNotes && <span className="text-xs text-brand-text/60">Saving...</span>}
                {showSavedIndicator && <span className="text-xs text-green-400">Saved</span>}
              </div>
            </div>
            <textarea
              value={notes}
              onChange={handleNotesChange}
              placeholder="Add personal notes here (e.g., shared with roommate, cancel in June)..."
              className="w-full h-32 bg-black/20 border border-white/10 rounded-xl p-3 text-brand-text placeholder-brand-text/40 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            />
          </div>

          {/* Cost History */}
          <div className="bg-white/5 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-white/10">
            <h2 className="text-xl font-bold text-brand-text mb-4">Cost History</h2>
            {chartData.length > 0 ? (
              <div className="space-y-6">
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                      <XAxis 
                        dataKey="dateStr" 
                        stroke="rgba(255,255,255,0.3)" 
                        tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} 
                      />
                      <YAxis 
                        stroke="rgba(255,255,255,0.3)" 
                        tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                        tickFormatter={(val) => {
                          const symbol = new Intl.NumberFormat('en-US', {style:'currency', currency: subscription.currency || 'USD'}).formatToParts(0).find(p=>p.type==='currency')?.value || '$';
                          return `${symbol}${val}`;
                        }}
                      />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#1c011a', color: '#fed8fb', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}
                        formatter={(value, name, props) => [
                          `${formatCurrency(value, subscription.currency || 'USD')} / ${props.payload.billingCycle}`,
                          'Cost'
                        ]}
                        labelStyle={{ color: 'rgba(255,255,255,0.7)' }}
                      />
                      <Line 
                        type="stepAfter" 
                        dataKey="cost" 
                        stroke="#fed8fb" 
                        strokeWidth={2} 
                        dot={{ r: 4, fill: '#1c011a', stroke: '#fed8fb', strokeWidth: 2 }}
                        activeDot={{ r: 6, fill: '#fed8fb' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="space-y-2 mt-4 pt-4 border-t border-white/10">
                  {chartData.slice(0, -1).map((entry, index) => {
                    const nextEntry = chartData[index + 1];
                    return (
                      <div key={index} className="flex justify-between items-center text-sm text-brand-text/80 bg-black/20 p-2 rounded-lg">
                        <span>
                          {formatCurrency(entry.cost, subscription.currency || 'USD')} → {formatCurrency(nextEntry.cost, subscription.currency || 'USD')}
                        </span>
                        <span className="text-brand-text/50">
                          {entry.billingCycle} &middot; {entry.dateStr}
                        </span>
                      </div>
                    );
                  }).reverse()}
                </div>
              </div>
            ) : (
              <EmptyState 
                title="No price changes recorded yet" 
                message="We'll track this automatically going forward."
              />
            )}
          </div>
        </motion.div>

        <motion.div variants={itemVariant} className="space-y-6">
          {/* Usage History */}
          <div className="bg-white/5 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-white/10 max-h-96 flex flex-col">
            <h2 className="text-xl font-bold text-brand-text mb-4">Usage History</h2>
            {usageLogs.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <EmptyState 
                  title="No usage logged yet" 
                  message="Log usage from here or the subscriptions list to track value."
                />
              </div>
            ) : (
              <div className="overflow-y-auto pr-2 space-y-3 flex-1">
                {usageLogs.map(log => (
                  <div key={log._id} className="bg-black/20 p-3 rounded-lg border border-white/5">
                    <div className="text-sm font-medium text-brand-text">{formatDate(log.usedAt)}</div>
                    {log.note && <div className="text-sm text-brand-text/70 mt-1">{log.note}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notification History */}
          <div className="bg-white/5 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-white/10 max-h-96 flex flex-col">
            <h2 className="text-xl font-bold text-brand-text mb-4">Notification History</h2>
            {notifications.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <EmptyState 
                  title="No notifications" 
                  message="No alerts have been generated for this subscription yet."
                />
              </div>
            ) : (
              <div className="overflow-y-auto pr-2 space-y-3 flex-1">
                {notifications.map(notif => (
                  <div key={notif._id} className="bg-black/20 p-3 rounded-lg border border-white/5 flex flex-col">
                    <div className="flex justify-between items-start">
                      <span className="text-sm text-brand-text font-medium">{notif.title}</span>
                      <span className="text-xs text-brand-text/50">{formatDate(notif.sentAt)}</span>
                    </div>
                    <span className="text-sm text-brand-text/70 mt-1">{notif.message}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {isEditModalOpen && (
        <Modal 
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Subscription"
        >
          <SubscriptionForm 
            initialData={subscription}
            onSubmit={handleEditSubmit}
            onCancel={() => setIsEditModalOpen(false)}
            submitting={actionLoading}
          />
        </Modal>
      )}

      {isCancelModalOpen && (
        <ConfirmDialog
          isOpen={isCancelModalOpen}
          title="Cancel Subscription"
          message={`Are you sure you want to mark ${subscription.name} as cancelled?`}
          confirmLabel="Yes, Cancel it"
          onConfirm={handleCancelConfirm}
          onClose={() => setIsCancelModalOpen(false)}
          confirmVariant="danger"
          loading={actionLoading}
        />
      )}

      {isLogUsageModalOpen && (
        <LogUsageModal
          isOpen={isLogUsageModalOpen}
          onClose={() => setIsLogUsageModalOpen(false)}
          subscription={subscription}
          onSubmit={handleLogUsageSubmit}
        />
      )}
    </div>
  );
};

export default SubscriptionDetailPage;
