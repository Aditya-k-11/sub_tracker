import React from 'react';
import Badge from '../common/Badge';
import { formatCurrency, daysUntil, billingCycleLabel } from '../../utils/formatters';
import { motion } from 'framer-motion';
import Button from '../common/Button';

const SubscriptionCard = ({ subscription, onEdit, onCancel, onLogUsage }) => {
  const { 
    _id, 
    name, 
    cost, 
    currency,
    billingCycle, 
    billingCycleInterval,
    category, 
    status, 
    isTrial, 
    trialEndDate, 
    nextRenewalDate 
  } = subscription;

  const displayStatus = isTrial ? 'trial' : status;

  let renewalText = '';
  let isOverdue = false;

  if (status === 'cancelled') {
    renewalText = 'Cancelled';
  } else if (isTrial && trialEndDate) {
    const days = daysUntil(trialEndDate);
    if (days < 0) {
      renewalText = 'Trial expired';
      isOverdue = true;
    } else {
      renewalText = `Trial ends in ${days} days`;
    }
  } else if (nextRenewalDate) {
    const days = daysUntil(nextRenewalDate);
    if (days < 0) {
      renewalText = 'Renewal overdue';
      isOverdue = true;
    } else {
      renewalText = `Renews in ${days} days`;
    }
  } else {
    renewalText = 'No renewal date';
  }

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="bg-gradient-to-br from-brand-bg/90 via-primary/20 to-brand-bg/90 bg-[length:200%_200%] animate-gradient-shift backdrop-blur-md border border-white/10 shadow-xl shadow-primary/5 rounded-2xl p-5 flex flex-col h-full"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-bold text-brand-text truncate pr-2">{name}</h3>
        <Badge text={displayStatus.toUpperCase()} variant={displayStatus} />
      </div>
      
      <div className="text-brand-text/70 text-sm mb-4">
        <span className="font-medium text-brand-text">{formatCurrency(cost, currency)}</span> / {billingCycleLabel(billingCycle, billingCycleInterval)}
      </div>
      
      <div className="mb-4 text-sm text-brand-text/70 flex items-center justify-between">
        <span className="bg-white/10 text-brand-text px-2 py-1 rounded text-xs">{category}</span>
        <span className={`font-medium text-xs ${isOverdue ? 'text-secondary' : 'text-brand-text/70'}`}>
          {renewalText}
        </span>
      </div>

      <div className="mt-auto pt-4 border-t border-white/10 flex justify-end space-x-2">
        <Button 
          variant="secondary"
          size="sm"
          onClick={() => onLogUsage(_id)}
        >
          Log Usage
        </Button>
        <Button 
          variant="secondary"
          size="sm"
          onClick={() => onEdit(subscription)}
        >
          Edit
        </Button>
        {status !== 'cancelled' && (
          <Button 
            variant="danger"
            size="sm"
            onClick={() => onCancel(_id)}
          >
            Cancel
          </Button>
        )}
      </div>
    </motion.div>
  );
};

export default React.memo(SubscriptionCard);
