import React from 'react';
import SubscriptionCard from './SubscriptionCard';
import EmptyState from '../common/EmptyState';
import { motion, AnimatePresence } from 'framer-motion';

const SubscriptionList = ({ subscriptions, onEdit, onCancel, onLogUsage, selectionMode = false, selectedIds = [], onToggleSelect }) => {
  if (!subscriptions || subscriptions.length === 0) {
    return (
      <EmptyState 
        title="No subscriptions yet"
        message="Keep track of your recurring expenses by adding your first subscription."
        actionLabel="Add your first subscription"
        onAction={() => console.log('Add subscription clicked')} 
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <AnimatePresence>
      {subscriptions.map((sub, index) => (
        <motion.div 
          key={sub._id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ delay: index * 0.05 }}
        >
          <SubscriptionCard 
            subscription={sub} 
            onEdit={onEdit}
            onCancel={onCancel}
            onLogUsage={onLogUsage}
            selectable={selectionMode}
            isSelected={selectedIds.includes(sub._id)}
            onToggleSelect={onToggleSelect}
          />
        </motion.div>
      ))}
      </AnimatePresence>
    </div>
  );
};

export default SubscriptionList;
