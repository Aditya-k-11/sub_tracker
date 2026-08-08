import React, { useState } from 'react';
import Badge from '../common/Badge';
import { formatDate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import Button from '../common/Button';

const CATEGORIES = [
  'Entertainment', 'Productivity', 'Utilities', 'Fitness', 
  'Education', 'Software', 'Other'
];

const SuggestionCard = ({ suggestion, onConfirm, onDismiss }) => {
  const { user } = useAuth();
  const [cost, setCost] = useState(suggestion.suggestedCost || '');
  const [billingCycle, setBillingCycle] = useState(suggestion.suggestedBillingCycle || 'monthly');
  const [category, setCategory] = useState(suggestion.suggestedCategory || 'Other');

  const defaultDate = new Date();
  defaultDate.setMonth(defaultDate.getMonth() + 1);
  const [nextRenewalDate, setNextRenewalDate] = useState(defaultDate.toISOString().split('T')[0]);
  
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm(suggestion._id, { 
      cost: cost ? parseFloat(cost) : null, 
      billingCycle, 
      category, 
      nextRenewalDate 
    });
    setLoading(false);
  };

  const handleDismiss = async () => {
    setLoading(true);
    await onDismiss(suggestion._id);
    setLoading(false);
  };

  const isUnknown = !suggestion.suggestedName;

  const currencyCode = user?.currency || 'INR';
  const symbolParts = new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode }).formatToParts(0);
  const currencySymbol = symbolParts.find(p => p.type === 'currency')?.value || '$';

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="bg-white/90 rounded-2xl shadow-xl shadow-primary-900/5 p-5 border border-white/40 flex flex-col md:flex-row md:items-start md:justify-between gap-6 transition"
    >
      <div className="flex-1 space-y-4">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <h3 className={`text-lg font-bold ${isUnknown ? 'italic text-gray-500' : 'text-gray-900'}`}>
              {isUnknown ? 'Unknown service' : suggestion.suggestedName}
            </h3>
            <Badge text={`${suggestion.confidence} confidence`} variant={suggestion.confidence} />
          </div>
          <div className="text-xs text-gray-500 space-y-0.5">
            <p>From: {suggestion.sourceSender}</p>
            <p>Subject: {suggestion.sourceSubject}</p>
            <p>Date: {formatDate(suggestion.sourceDate)}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-xl">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Cost</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">{currencySymbol}</span>
              </div>
              <input 
                type="number"
                step="0.01"
                min="0"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className="block w-full pl-6 pr-2 py-1 sm:text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="0.00"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Cycle</label>
            <select 
              value={billingCycle}
              onChange={(e) => setBillingCycle(e.target.value)}
              className="block w-full py-1 px-2 border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="block w-full py-1 px-2 border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Next Renewal</label>
            <input 
              type="date"
              value={nextRenewalDate}
              onChange={(e) => setNextRenewalDate(e.target.value)}
              className="block w-full py-1 px-2 border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
          </div>
        </div>
      </div>

      <div className="flex md:flex-col justify-end gap-3 mt-2 md:mt-0">
        <Button
          onClick={handleConfirm}
          loading={loading}
        >
          Confirm
        </Button>
        <Button
          variant="secondary"
          onClick={handleDismiss}
          loading={loading}
        >
          Dismiss
        </Button>
      </div>
    </motion.div>
  );
};

export default SuggestionCard;
