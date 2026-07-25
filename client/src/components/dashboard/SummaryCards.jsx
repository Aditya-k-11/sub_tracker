import React from 'react';
import { formatCurrency } from '../../utils/formatters';
import { Layers, Sparkles } from 'lucide-react';

const SummaryCards = ({ summary }) => {
  if (!summary) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Monthly Spend */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 flex flex-col justify-center">
        <h3 className="text-xs uppercase tracking-wide text-gray-500 mb-2 font-medium">Monthly Spend</h3>
        <div className="text-4xl lg:text-5xl font-bold tabular-nums text-gray-900 mb-1">
          {formatCurrency(summary.totalMonthlySpend, 'INR')}
        </div>
        <p className="text-sm text-gray-500">
          Yearly: {formatCurrency(summary.totalYearlySpend, 'INR')}
        </p>
      </div>

      {/* Active Subscriptions */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 relative overflow-hidden flex flex-col justify-center">
        <div className="absolute top-6 right-6 bg-primary-50 p-3 rounded-full text-primary-600">
          <Layers size={24} />
        </div>
        <h3 className="text-xs uppercase tracking-wide text-gray-500 mb-2 font-medium">Active Subscriptions</h3>
        <div className="text-4xl font-bold tabular-nums text-gray-900">
          {summary.activeSubscriptionCount}
        </div>
      </div>

      {/* Active Trials */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 relative overflow-hidden flex flex-col justify-center">
        <div className="absolute top-6 right-6 bg-purple-50 p-3 rounded-full text-purple-600">
          <Sparkles size={24} />
        </div>
        <h3 className="text-xs uppercase tracking-wide text-gray-500 mb-2 font-medium">Active Trials</h3>
        {summary.trialCount > 0 ? (
          <div className="text-4xl font-bold tabular-nums text-gray-900">
            {summary.trialCount}
          </div>
        ) : (
          <div className="text-sm text-gray-500 mt-2">No active trials</div>
        )}
      </div>
    </div>
  );
};

export default SummaryCards;
