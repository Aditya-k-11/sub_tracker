import React from 'react';
import SubscriptionCard from './SubscriptionCard';
import EmptyState from '../common/EmptyState';

const SubscriptionList = ({ subscriptions, onEdit, onCancel, onLogUsage }) => {
  if (!subscriptions || subscriptions.length === 0) {
    return (
      <EmptyState 
        title="No subscriptions yet"
        message="Keep track of your recurring expenses by adding your first subscription."
        actionLabel="Add your first subscription"
        onAction={() => console.log('Add subscription clicked')} // Placeholder for 5.2
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {subscriptions.map(sub => (
        <SubscriptionCard 
          key={sub._id} 
          subscription={sub} 
          onEdit={onEdit}
          onCancel={onCancel}
          onLogUsage={onLogUsage}
        />
      ))}
    </div>
  );
};

export default SubscriptionList;
