import React, { useState, useEffect, useCallback } from 'react';
import PageTransition from '../components/common/PageTransition';
import { getSubscriptions, createSubscription, updateSubscription, cancelSubscription, logUsage } from '../services/subscriptionService';
import SubscriptionList from '../components/subscriptions/SubscriptionList';
import SubscriptionForm from '../components/subscriptions/SubscriptionForm';
import Spinner from '../components/common/Spinner';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import LogUsageModal from '../components/subscriptions/LogUsageModal';
import Toast from '../components/common/Toast';
import Button from '../components/common/Button';

const SubscriptionsPage = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const [usageTarget, setUsageTarget] = useState(null);
  const [loggingUsage, setLoggingUsage] = useState(false);

  const [toast, setToast] = useState(null);

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getSubscriptions();
      setSubscriptions(response.subscriptions || []); 
    } catch (err) {
      setError('Failed to load subscriptions. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const showToast = (message, type = 'success') => setToast({ message, type });
  const dismissToast = () => setToast(null);

  const handleAddClick = useCallback(() => {
    setEditingSubscription(null);
    setFormError(null);
    setIsFormOpen(true);
  }, []);

  const handleEditClick = useCallback((subscription) => {
    setEditingSubscription(subscription);
    setFormError(null);
    setIsFormOpen(true);
  }, []);

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingSubscription(null);
    setFormError(null);
  };

  const handleFormSubmit = async (formData) => {
    setSubmitting(true);
    setFormError(null);

    try {
      if (editingSubscription) {
        await updateSubscription(editingSubscription._id, formData);
        showToast('Subscription updated');
      } else {
        await createSubscription(formData);
        showToast('Subscription created');
      }
      setIsFormOpen(false);
      setEditingSubscription(null);
      await fetchSubscriptions();
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        if (err.response.data.details) {
          const messages = err.response.data.details.map(d => d.message).join(', ');
          setFormError(messages);
        } else {
          setFormError(err.response.data.error);
        }
      } else {
        setFormError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelClick = useCallback((id) => {
    const target = subscriptions.find(s => s._id === id);
    if (target) setCancelTarget(target);
  }, [subscriptions]);

  const handleCancelConfirm = async () => {
    setCancelling(true);
    try {
      await cancelSubscription(cancelTarget._id);
      showToast('Subscription cancelled');
      setCancelTarget(null);
      await fetchSubscriptions();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to cancel subscription', 'error');
    } finally {
      setCancelling(false);
    }
  };

  const handleCancelDialogClose = () => {
    setCancelTarget(null);
  };

  const handleLogUsageClick = useCallback((id) => {
    const target = subscriptions.find(s => s._id === id);
    if (target) setUsageTarget(target);
  }, [subscriptions]);

  const handleLogUsageSubmit = async (note) => {
    setLoggingUsage(true);
    try {
      await logUsage(usageTarget._id, note);
      showToast('Usage logged');
      setUsageTarget(null);
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to log usage', 'error');
    } finally {
      setLoggingUsage(false);
    }
  };

  const handleLogUsageClose = () => {
    setUsageTarget(null);
  };

  if (loading && subscriptions.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error && subscriptions.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg text-center shadow-sm max-w-lg mx-auto">
          <p className="mb-4">{error}</p>
          <Button 
            variant="danger"
            onClick={fetchSubscriptions}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <PageTransition className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onDismiss={dismissToast} 
        />
      )}

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-brand-text">Your Subscriptions</h1>
        <Button onClick={handleAddClick}>
          Add Subscription
        </Button>
      </div>
      
      <SubscriptionList 
        subscriptions={subscriptions}
        onEdit={handleEditClick}
        onCancel={handleCancelClick}
        onLogUsage={handleLogUsageClick}
      />

      <Modal 
        isOpen={isFormOpen} 
        onClose={handleFormClose}
        title={editingSubscription ? 'Edit Subscription' : 'Add Subscription'}
      >
        <SubscriptionForm 
          initialData={editingSubscription}
          onSubmit={handleFormSubmit}
          onCancel={handleFormClose}
          submitting={submitting}
          formError={formError}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!cancelTarget}
        onClose={handleCancelDialogClose}
        onConfirm={handleCancelConfirm}
        title="Cancel Subscription"
        message={`Are you sure you want to cancel "${cancelTarget?.name}"? This won't delete its history, but it will stop appearing as active.`}
        confirmLabel="Cancel Subscription"
        confirmVariant="danger"
        loading={cancelling}
      />

      <LogUsageModal
        isOpen={!!usageTarget}
        onClose={handleLogUsageClose}
        subscription={usageTarget}
        onSubmit={handleLogUsageSubmit}
        submitting={loggingUsage}
      />
    </PageTransition>
  );
};

export default SubscriptionsPage;
