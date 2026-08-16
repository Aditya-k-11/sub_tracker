import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { getCategoryDetail } from '../services/analyticsService';
import { updateSubscription, cancelSubscription, logUsage } from '../services/subscriptionService';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatters';
import Spinner from '../components/common/Spinner';
import Button from '../components/common/Button';
import SubscriptionCard from '../components/subscriptions/SubscriptionCard';
import Modal from '../components/common/Modal';
import SubscriptionForm from '../components/subscriptions/SubscriptionForm';
import ConfirmDialog from '../components/common/ConfirmDialog';
import LogUsageModal from '../components/subscriptions/LogUsageModal';

const CategoryDetailPage = () => {
  const { categoryName } = useParams();
  const category = decodeURIComponent(categoryName);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals state for SubscriptionCard actions
  const [editingSubscription, setEditingSubscription] = useState(null);
  const [cancellingSubscriptionId, setCancellingSubscriptionId] = useState(null);
  const [loggingUsageSubscription, setLoggingUsageSubscription] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCategoryDetail(category);
      setDetail(data);
    } catch (err) {
      setError('Failed to load category details. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  const handleEditSubmit = async (data) => {
    try {
      setActionLoading(true);
      await updateSubscription(editingSubscription._id, data);
      setEditingSubscription(null);
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
      await cancelSubscription(cancellingSubscriptionId);
      setCancellingSubscriptionId(null);
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
      await logUsage(loggingUsageSubscription._id, note);
      setLoggingUsageSubscription(null);
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
        <Button onClick={() => navigate(-1)} variant="secondary">Go Back</Button>
      </div>
    );
  }

  if (!detail) return null;

  const { subscriptions, totalMonthlySpend, subscriptionCount, categoryTrend, overlapWarning } = detail;

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

  // Check if we have trend data to show
  const hasTrendData = categoryTrend && categoryTrend.some(t => t.categorySpend > 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-2 -ml-2 text-brand-text/70">
        ← Back
      </Button>
      
      <motion.div 
        variants={staggerContainer} initial="hidden" animate="show"
        className="space-y-6"
      >
        {/* Header */}
        <motion.div variants={itemVariant} className="bg-white/5 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-brand-text mb-1">{category}</h1>
            <p className="text-brand-text/70">{subscriptionCount} active subscription{subscriptionCount !== 1 ? 's' : ''}</p>
          </div>
          <div className="mt-4 md:mt-0 text-left md:text-right bg-black/20 p-4 rounded-xl">
            <p className="text-xs text-brand-text/60 uppercase tracking-wider mb-1">Total Monthly Spend</p>
            <p className="text-2xl font-bold text-brand-text">{formatCurrency(totalMonthlySpend, detail.currency)}</p>
          </div>
        </motion.div>

        {/* Overlap Warning */}
        {overlapWarning && (
          <motion.div variants={itemVariant} className="bg-amber-500/20 border border-amber-500/50 rounded-xl p-4 flex items-center space-x-3 text-amber-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="font-medium">You have {subscriptionCount} active {category} subscriptions — consider whether you need all of them.</span>
          </motion.div>
        )}

        {/* Trend Chart */}
        {hasTrendData && (
          <motion.div variants={itemVariant} className="bg-white/5 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-white/10">
            <h2 className="text-xl font-bold text-brand-text mb-6">Spend Trend</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={categoryTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f76c2e" stopOpacity={0.5}/>
                      <stop offset="95%" stopColor="#f76c2e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis 
                    dataKey="month" 
                    stroke="rgba(255,255,255,0.3)" 
                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                    tickMargin={10}
                    tickFormatter={(val) => {
                      const [, m] = val.split('-');
                      const date = new Date();
                      date.setMonth(parseInt(m) - 1);
                      return date.toLocaleString('default', { month: 'short' });
                    }}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.3)" 
                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                    tickFormatter={(val) => {
                      const symbol = new Intl.NumberFormat('en-US', {style:'currency', currency: detail.currency || 'USD'}).formatToParts(0).find(p=>p.type==='currency')?.value || '$';
                      return `${symbol}${val}`;
                    }}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1c011a', color: '#fed8fb', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}
                    formatter={(value) => [formatCurrency(value, detail.currency), 'Spend']}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="categorySpend" 
                    stroke="#f76c2e" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorSpend)" 
                    isAnimationActive={true}
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {/* Subscriptions Grid */}
        <motion.div variants={itemVariant}>
          <h2 className="text-xl font-bold text-brand-text mb-4">Subscriptions in {category}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subscriptions.map(subscription => (
              <SubscriptionCard
                key={subscription._id}
                subscription={subscription}
                onEdit={() => setEditingSubscription(subscription)}
                onCancel={(id) => setCancellingSubscriptionId(id)}
                onLogUsage={() => setLoggingUsageSubscription(subscription)}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Modals reused from Subscriptions list */}
      {editingSubscription && (
        <Modal 
          isOpen={!!editingSubscription}
          onClose={() => setEditingSubscription(null)}
          title="Edit Subscription"
        >
          <SubscriptionForm 
            initialData={editingSubscription}
            onSubmit={handleEditSubmit}
            onCancel={() => setEditingSubscription(null)}
            submitting={actionLoading}
          />
        </Modal>
      )}

      {cancellingSubscriptionId && (
        <ConfirmDialog
          isOpen={!!cancellingSubscriptionId}
          title="Cancel Subscription"
          message={`Are you sure you want to mark this subscription as cancelled?`}
          confirmLabel="Yes, Cancel it"
          onConfirm={handleCancelConfirm}
          onCancel={() => setCancellingSubscriptionId(null)}
          isDanger={true}
        />
      )}

      {loggingUsageSubscription && (
        <LogUsageModal
          isOpen={!!loggingUsageSubscription}
          onClose={() => setLoggingUsageSubscription(null)}
          subscription={loggingUsageSubscription}
          onSubmit={handleLogUsageSubmit}
        />
      )}
    </div>
  );
};

export default CategoryDetailPage;
