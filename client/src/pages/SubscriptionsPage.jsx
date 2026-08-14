import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import PageTransition from '../components/common/PageTransition';
import { getSubscriptions, createSubscription, updateSubscription, cancelSubscription, logUsage, bulkUpdateSubscriptions } from '../services/subscriptionService';
import SubscriptionList from '../components/subscriptions/SubscriptionList';
import SubscriptionForm from '../components/subscriptions/SubscriptionForm';
import SubscriptionFilters from '../components/subscriptions/SubscriptionFilters';
import BulkActionsBar from '../components/subscriptions/BulkActionsBar';
import Spinner from '../components/common/Spinner';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import LogUsageModal from '../components/subscriptions/LogUsageModal';
import Toast from '../components/common/Toast';
import Button from '../components/common/Button';

const getInitialFilters = () => {
  const saved = localStorage.getItem('subtrack_subscription_filters');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
  }
  return { category: "", status: "", sortBy: "nextRenewalDate", sortOrder: "asc" };
};

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

  const [filters, setFilters] = useState(getInitialFilters);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkProcessing, setBulkProcessing] = useState(false);

  useEffect(() => {
    localStorage.setItem('subtrack_subscription_filters', JSON.stringify(filters));
  }, [filters]);

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const activeFilters = {};
      if (filters.category) activeFilters.category = filters.category;
      if (filters.status) activeFilters.status = filters.status;
      if (filters.sortBy) activeFilters.sortBy = filters.sortBy;
      if (filters.sortOrder) activeFilters.sortOrder = filters.sortOrder;

      const response = await getSubscriptions(activeFilters);
      setSubscriptions(response.subscriptions || []); 
    } catch (err) {
      setError('Failed to load subscriptions. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  useEffect(() => {
    if (searchParams.get('openAdd') === 'true') {
      setIsFormOpen(true);
      searchParams.delete('openAdd');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

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

  const handleToggleSelectionMode = () => {
    if (selectionMode) {
      setSelectionMode(false);
      setSelectedIds([]);
    } else {
      setSelectionMode(true);
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  const handleBulkCancel = async () => {
    setBulkProcessing(true);
    try {
      const result = await bulkUpdateSubscriptions(selectedIds, { type: 'cancel' });
      showToast(`${result.modifiedCount} subscriptions cancelled`);
      if (result.matchedCount < result.requestedCount) {
        setTimeout(() => showToast(`Note: ${result.requestedCount - result.matchedCount} subscriptions were skipped.`, 'info'), 3500);
      }
      setSelectionMode(false);
      setSelectedIds([]);
      fetchSubscriptions();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to bulk cancel', 'danger');
    } finally {
      setBulkProcessing(false);
    }
  };

  const handleBulkRecategorize = async (category) => {
    setBulkProcessing(true);
    try {
      const result = await bulkUpdateSubscriptions(selectedIds, { type: 'recategorize', category });
      showToast(`${result.modifiedCount} subscriptions recategorized`);
      if (result.matchedCount < result.requestedCount) {
        setTimeout(() => showToast(`Note: ${result.requestedCount - result.matchedCount} subscriptions were skipped.`, 'info'), 3500);
      }
      setSelectionMode(false);
      setSelectedIds([]);
      fetchSubscriptions();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to bulk recategorize', 'danger');
    } finally {
      setBulkProcessing(false);
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
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-2xl text-center shadow-xl backdrop-blur-md max-w-lg mx-auto">
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

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-brand-text">Your Subscriptions</h1>
        <div className="flex items-center gap-3">
          <Button 
            variant={selectionMode ? 'secondary' : 'outline'} 
            onClick={handleToggleSelectionMode}
          >
            {selectionMode ? 'Cancel Selection' : 'Select'}
          </Button>
          <Button onClick={handleAddClick}>
            Add Subscription
          </Button>
        </div>
      </div>
      
      <SubscriptionFilters currentFilters={filters} onChange={setFilters} />

      <SubscriptionList 
        subscriptions={subscriptions}
        onEdit={handleEditClick}
        onCancel={handleCancelClick}
        onLogUsage={handleLogUsageClick}
        selectionMode={selectionMode}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
      />

      <BulkActionsBar 
        selectedCount={selectedIds.length}
        onBulkCancel={handleBulkCancel}
        onBulkRecategorize={handleBulkRecategorize}
        onClearSelection={handleClearSelection}
        processing={bulkProcessing}
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
