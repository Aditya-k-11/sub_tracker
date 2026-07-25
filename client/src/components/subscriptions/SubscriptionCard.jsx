import React from 'react';
import Badge from '../common/Badge';
import { formatCurrency, daysUntil, billingCycleLabel } from '../../utils/formatters';

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
  
  // Logic for renewal/trial days
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
    <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition flex flex-col h-full">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-bold text-gray-900 truncate pr-2">{name}</h3>
        <Badge text={displayStatus.toUpperCase()} variant={displayStatus} />
      </div>
      
      <div className="text-gray-500 text-sm mb-4">
        <span className="font-medium text-gray-700">{formatCurrency(cost, currency)}</span> / {billingCycleLabel(billingCycle, billingCycleInterval)}
      </div>
      
      <div className="mb-4 text-sm text-gray-500 flex items-center justify-between">
        <span className="bg-gray-100 px-2 py-1 rounded text-xs">{category}</span>
        <span className={`font-medium text-xs ${isOverdue ? 'text-red-600' : 'text-gray-600'}`}>
          {renewalText}
        </span>
      </div>

      <div className="mt-auto pt-4 border-t border-gray-100 flex justify-end space-x-2">
        <button 
          onClick={() => onLogUsage(_id)}
          className="text-xs font-medium text-primary-600 bg-primary-50 px-3 py-1.5 rounded hover:bg-primary-100 transition"
        >
          Log Usage
        </button>
        <button 
          onClick={() => onEdit(subscription)}
          className="text-xs font-medium text-gray-600 bg-gray-100 px-3 py-1.5 rounded hover:bg-gray-200 transition"
        >
          Edit
        </button>
        {status !== 'cancelled' && (
          <button 
            onClick={() => onCancel(_id)}
            className="text-xs font-medium text-red-600 bg-red-50 px-3 py-1.5 rounded hover:bg-red-100 transition"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

export default SubscriptionCard;
