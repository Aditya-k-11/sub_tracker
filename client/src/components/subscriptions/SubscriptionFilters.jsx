import React from 'react';
import { ArrowUpDown } from 'lucide-react';

const SubscriptionFilters = ({ currentFilters, onChange }) => {
  const handleChange = (field, value) => {
    onChange({
      ...currentFilters,
      [field]: value
    });
  };

  const toggleSortOrder = () => {
    onChange({
      ...currentFilters,
      sortOrder: currentFilters.sortOrder === 'asc' ? 'desc' : 'asc'
    });
  };

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-xl mb-6 flex flex-wrap gap-4 items-center">
      <div className="flex-1 min-w-[200px]">
        <label className="block text-xs font-medium text-white/50 mb-1">Category</label>
        <select
          value={currentFilters.category}
          onChange={(e) => handleChange('category', e.target.value)}
          className="w-full bg-gradient-to-br from-brand-bg/90 via-primary/20 to-brand-bg/90 bg-[length:200%_200%] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option className="bg-brand-bg" value="">All Categories</option>
          <option className="bg-brand-bg" value="Entertainment">Entertainment</option>
          <option className="bg-brand-bg" value="Fitness">Fitness</option>
          <option className="bg-brand-bg" value="Productivity">Productivity</option>
          <option className="bg-brand-bg" value="Utilities">Utilities</option>
          <option className="bg-brand-bg" value="Other">Other</option>
        </select>
      </div>

      <div className="flex-1 min-w-[150px]">
        <label className="block text-xs font-medium text-white/50 mb-1">Status</label>
        <select
          value={currentFilters.status}
          onChange={(e) => handleChange('status', e.target.value)}
          className="w-full bg-gradient-to-br from-brand-bg/90 via-primary/20 to-brand-bg/90 bg-[length:200%_200%] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option className="bg-brand-bg" value="">All</option>
          <option className="bg-brand-bg" value="active">Active</option>
          <option className="bg-brand-bg" value="paused">Paused</option>
          <option className="bg-brand-bg" value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="flex-1 min-w-[180px] flex gap-2">
        <div className="flex-1">
          <label className="block text-xs font-medium text-white/50 mb-1">Sort By</label>
          <select
            value={currentFilters.sortBy}
            onChange={(e) => handleChange('sortBy', e.target.value)}
            className="w-full bg-gradient-to-br from-brand-bg/90 via-primary/20 to-brand-bg/90 bg-[length:200%_200%] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option className="bg-brand-bg" value="nextRenewalDate">Renewal Date</option>
            <option className="bg-brand-bg" value="cost">Cost</option>
            <option className="bg-brand-bg" value="name">Name</option>
            <option className="bg-brand-bg" value="createdAt">Date Added</option>
          </select>
        </div>
        <div className="flex items-end">
          <button
            onClick={toggleSortOrder}
            className="bg-black/20 hover:bg-black/40 border border-white/10 rounded-lg p-2 h-[42px] text-white/70 hover:text-white transition-colors"
            title={`Sort ${currentFilters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
          >
            <ArrowUpDown 
              className={`w-5 h-5 transition-transform duration-300 ${
                currentFilters.sortOrder === 'desc' ? 'rotate-180' : ''
              }`} 
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionFilters;
