import React, { useState } from 'react';
import { formatCurrency } from '../../utils/formatters';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import LogUsageModal from '../subscriptions/LogUsageModal';

const WastedSpendPanel = ({ flagged, potentialSavings, onUsageLogged, submittingUsage }) => {
  const [usageTarget, setUsageTarget] = useState(null);

  if (!flagged || flagged.length === 0) {
    return (
      <div className="bg-accent-50 rounded-2xl shadow-sm p-10 border border-accent-100 flex flex-col items-center text-center">
        <CheckCircle2 size={36} className="text-accent-500 mb-3" />
        <h3 className="text-lg font-medium text-accent-900 mb-1">Nothing flagged</h3>
        <p className="text-accent-700 text-sm">You're using everything you pay for.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
      <div className="bg-warning-50 p-6 border-b border-warning-100 flex items-center justify-between">
        <div>
          <h3 className="text-xs uppercase tracking-wide text-warning-700 font-bold mb-1">Potential Wasted Spend</h3>
          <div className="text-2xl sm:text-3xl font-bold text-warning-900 flex items-center tracking-tight">
            <AlertCircle className="mr-3 text-warning-600" size={28} />
            {formatCurrency(potentialSavings, 'INR')} <span className="text-sm font-normal text-warning-700 ml-2 mt-1">/ month</span>
          </div>
        </div>
      </div>
      
      <div className="divide-y divide-gray-100">
        {flagged.map(sub => (
          <div key={sub.subscriptionId} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 transition hover:bg-gray-50/50">
            <div>
              <div className="flex items-center space-x-3 mb-1.5">
                <span className="font-semibold text-gray-900">{sub.name}</span>
                <span className="px-2.5 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">{sub.category}</span>
              </div>
              <p className="text-sm text-gray-500 mb-1.5">{sub.reason}</p>
              <p className="text-xs font-medium text-gray-400">
                Cost per use: {sub.costPerUse !== null ? `${formatCurrency(sub.costPerUse, 'INR')}/use` : 'Never used'}
              </p>
            </div>
            
            <div className="flex items-center justify-between md:justify-end space-x-6">
              <div className="text-left md:text-right">
                <div className="font-bold text-gray-900 tabular-nums">{formatCurrency(sub.monthlyCost, 'INR')}</div>
                <div className="text-xs text-gray-500">per month</div>
              </div>
              <button 
                onClick={() => setUsageTarget(sub)}
                className="px-4 py-2 bg-white border border-gray-200 shadow-sm text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition"
              >
                Log usage
              </button>
            </div>
          </div>
        ))}
      </div>

      <LogUsageModal
        isOpen={!!usageTarget}
        onClose={() => setUsageTarget(null)}
        subscription={usageTarget ? { _id: usageTarget.subscriptionId, name: usageTarget.name } : null}
        onSubmit={async (note) => {
          await onUsageLogged(usageTarget.subscriptionId, note);
          setUsageTarget(null);
        }}
        submitting={submittingUsage}
      />
    </div>
  );
};

export default WastedSpendPanel;
