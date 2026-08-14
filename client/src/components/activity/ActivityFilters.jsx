import React from 'react';

const ACTION_TYPES = [
  { value: '', label: 'All Activity' },
  { value: 'subscription_created', label: 'Created' },
  { value: 'subscription_updated', label: 'Updated' },
  { value: 'subscription_cancelled', label: 'Cancelled' },
  { value: 'usage_logged', label: 'Usage Logged' },
  { value: 'suggestion_confirmed', label: 'Suggestion Confirmed' },
  { value: 'suggestion_dismissed', label: 'Suggestion Dismissed' },
  { value: 'notes_updated', label: 'Notes Updated' },
  { value: 'budget_set', label: 'Budget Set' }
];

const ActivityFilters = ({ currentFilters, onChange }) => {
  const handleChange = (field, value) => {
    onChange({
      ...currentFilters,
      [field]: value,
      page: 1 // Reset page when filters change
    });
  };

  return (
    <div className="bg-gradient-to-br from-brand-bg/90 via-primary/20 to-brand-bg/90 bg-[length:200%_200%] animate-gradient-shift backdrop-blur-md border border-white/10 p-4 rounded-xl mb-6 flex flex-wrap gap-4 items-center">
      <div className="flex-1 min-w-[200px]">
        <label className="block text-xs font-medium text-white/50 mb-1">Action Type</label>
        <select
          value={currentFilters.action || ''}
          onChange={(e) => handleChange('action', e.target.value)}
          className="w-full bg-black/20 text-white border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
        >
          {ACTION_TYPES.map(type => (
            <option key={type.value} value={type.value} className="bg-brand-bg">{type.label}</option>
          ))}
        </select>
      </div>

      <div className="flex-1 min-w-[150px]">
        <label className="block text-xs font-medium text-white/50 mb-1">From Date</label>
        <input
          type="date"
          value={currentFilters.startDate || ''}
          onChange={(e) => handleChange('startDate', e.target.value)}
          className="w-full bg-black/20 text-white border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 [color-scheme:dark]"
        />
      </div>

      <div className="flex-1 min-w-[150px]">
        <label className="block text-xs font-medium text-white/50 mb-1">To Date</label>
        <input
          type="date"
          value={currentFilters.endDate || ''}
          onChange={(e) => handleChange('endDate', e.target.value)}
          className="w-full bg-black/20 text-white border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 [color-scheme:dark]"
        />
      </div>
      
      <div className="flex items-end pb-0.5">
        <button
          onClick={() => onChange({ action: '', startDate: '', endDate: '', page: 1 })}
          className="px-4 py-2 text-sm font-medium text-white/60 hover:text-white transition-colors"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
};

export default ActivityFilters;
