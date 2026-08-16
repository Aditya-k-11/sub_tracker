import React, { useState, useEffect } from 'react';
import Button from '../common/Button';
import { useAuth } from '../../context/AuthContext';

const CATEGORIES = ['Entertainment', 'Fitness', 'Productivity', 'Utilities', 'Other'];

const SubscriptionForm = ({ initialData, onSubmit, onCancel, submitting, formError }) => {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    cost: '',
    currency: user?.currency || 'USD',
    billingCycle: 'monthly',
    billingCycleInterval: 1,
    category: 'Entertainment',
    nextRenewalDate: '',
    isTrial: false,
    trialEndDate: '',
    paymentMethod: ''
  });

  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        cost: initialData.cost || '',
        currency: initialData.currency || user?.currency || 'USD',
        billingCycle: initialData.billingCycle || 'monthly',
        billingCycleInterval: initialData.billingCycleInterval || 1,
        category: initialData.category || 'Entertainment',
        nextRenewalDate: initialData.nextRenewalDate ? initialData.nextRenewalDate.split('T')[0] : '',
        isTrial: initialData.isTrial || false,
        trialEndDate: initialData.trialEndDate ? initialData.trialEndDate.split('T')[0] : '',
        paymentMethod: initialData.paymentMethod || ''
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.cost || Number(formData.cost) < 0) errors.cost = 'Valid cost is required';
    if (!formData.billingCycleInterval || Number(formData.billingCycleInterval) < 1) errors.billingCycleInterval = 'Interval must be >= 1';
    if (!formData.nextRenewalDate) errors.nextRenewalDate = 'Renewal date is required';
    if (formData.isTrial && !formData.trialEndDate) errors.trialEndDate = 'Trial end date is required if trial is active';
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const cleanedData = {
      ...formData,
      cost: Number(formData.cost),
      billingCycleInterval: Number(formData.billingCycleInterval)
    };

    if (!cleanedData.isTrial) {
      delete cleanedData.trialEndDate;
    }

    onSubmit(cleanedData);
  };

  const isEdit = !!initialData;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {formError && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded text-sm mb-4">
          {formError}
        </div>
      )}

      <div>
        <label className="block text-white/80 font-medium mb-1">Subscription Name *</label>
        <input 
          type="text" 
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full bg-black/20 text-white border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
        />
        {validationErrors.name && <p className="text-red-500 text-xs mt-1">{validationErrors.name}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-white/80 font-medium mb-1">Cost & Currency *</label>
          <div className="flex space-x-2">
            <input 
              type="number" 
              name="cost"
              min="0"
              step="0.01"
              value={formData.cost}
              onChange={handleChange}
              className="w-2/3 bg-black/20 text-white border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            />
            <select
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              className="w-1/3 bg-black/20 text-white border border-white/20 rounded-lg px-2 py-2 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            >
              <option className="bg-brand-bg" value="USD">USD ($)</option>
              <option className="bg-brand-bg" value="EUR">EUR (€)</option>
              <option className="bg-brand-bg" value="GBP">GBP (£)</option>
              <option className="bg-brand-bg" value="INR">INR (₹)</option>
              <option className="bg-brand-bg" value="AUD">AUD ($)</option>
              <option className="bg-brand-bg" value="CAD">CAD ($)</option>
            </select>
          </div>
          {validationErrors.cost && <p className="text-red-500 text-xs mt-1">{validationErrors.cost}</p>}
        </div>
        <div>
          <label className="block text-white/80 font-medium mb-1">Billing Cycle *</label>
          <div className="flex space-x-2">
            <div className="w-1/3">
              <input 
                type="number"
                name="billingCycleInterval"
                min="1"
                step="1"
                value={formData.billingCycleInterval}
                onChange={handleChange}
                className="w-full bg-black/20 text-white border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <div className="w-2/3">
              <select 
                name="billingCycle"
                value={formData.billingCycle}
                onChange={handleChange}
                className="w-full bg-black/20 text-white border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              >
                <option className="bg-brand-bg" value="weekly">Weekly</option>
                <option className="bg-brand-bg" value="monthly">Monthly</option>
                <option className="bg-brand-bg" value="yearly">Yearly</option>
              </select>
            </div>
          </div>
          {validationErrors.billingCycleInterval && <p className="text-red-500 text-xs mt-1">{validationErrors.billingCycleInterval}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-white/80 font-medium mb-1">Category</label>
          <select 
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full bg-black/20 text-white border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          >
            {CATEGORIES.map(cat => <option className="bg-brand-bg" key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-white/80 font-medium mb-1">Payment Method</label>
          <input 
            type="text" 
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handleChange}
            placeholder="e.g. Credit Card"
            className="w-full bg-black/20 text-white border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-white/80 font-medium mb-1">Next Renewal Date *</label>
        <input 
          type="date" 
          name="nextRenewalDate"
          value={formData.nextRenewalDate}
          onChange={handleChange}
          className="w-full bg-black/20 text-white border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
        />
        {validationErrors.nextRenewalDate && <p className="text-red-500 text-xs mt-1">{validationErrors.nextRenewalDate}</p>}
      </div>

      <div className="flex items-center space-x-2 mt-4">
        <input 
          type="checkbox" 
          id="isTrial"
          name="isTrial"
          checked={formData.isTrial}
          onChange={handleChange}
          className="h-4 w-4 text-primary-600 rounded border-white/20 focus:ring-primary-500"
        />
        <label htmlFor="isTrial" className="text-white/80 font-medium cursor-pointer">This is a trial subscription</label>
      </div>

      {formData.isTrial && (
        <div>
          <label className="block text-white/80 font-medium mb-1">Trial End Date *</label>
          <input 
            type="date" 
            name="trialEndDate"
            value={formData.trialEndDate}
            onChange={handleChange}
            className="w-full bg-black/20 text-white border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          />
          {validationErrors.trialEndDate && <p className="text-red-500 text-xs mt-1">{validationErrors.trialEndDate}</p>}
        </div>
      )}

      <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-white/10">
        <Button 
          variant="secondary"
          onClick={onCancel}
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button 
          type="submit"
          loading={submitting}
        >
          {isEdit ? 'Save Changes' : 'Create Subscription'}
        </Button>
      </div>
    </form>
  );
};

export default SubscriptionForm;
