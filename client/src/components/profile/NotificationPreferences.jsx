import React from 'react';
import { updateNotificationPreferences } from '../../services/userService';

const Toggle = ({ checked, onChange, disabled }) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      disabled={disabled}
      className={`
        relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
        transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-brand-bg
        ${checked ? 'bg-primary-500' : 'bg-white/10'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <span
        aria-hidden="true"
        className={`
          pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 
          transition duration-200 ease-in-out
          ${checked ? 'translate-x-5' : 'translate-x-0'}
        `}
      />
    </button>
  );
};

const NotificationPreferences = ({ preferences, onChange, showToast }) => {
  const handleToggle = async (key, value) => {
    try {
      const updatedPrefs = { ...preferences, [key]: value };
      // Optimistic UI update
      onChange(updatedPrefs);
      
      await updateNotificationPreferences({ [key]: value });
      showToast('Preference updated', 'success');
    } catch (error) {
      // Revert on error
      onChange(preferences);
      showToast('Failed to update preference', 'error');
    }
  };

  const prefsData = [
    {
      id: 'renewalReminders',
      label: 'Renewal reminders',
      description: 'Get notified before your subscriptions renew'
    },
    {
      id: 'trialEndingAlerts',
      label: 'Trial-ending alerts',
      description: 'Get notified before your free trials convert to paid'
    },
    {
      id: 'wastedSpendAlerts',
      label: 'Wasted-spend alerts',
      description: 'Get notified about unused subscriptions (coming soon)',
      disabled: false,
      comingSoon: true
    }
  ];

  return (
    <div className="space-y-6">
      {prefsData.map((item) => (
        <div key={item.id} className="flex items-center justify-between">
          <div className="pr-4">
            <h4 className="text-sm font-medium text-white flex items-center gap-2">
              {item.label}
              {item.comingSoon && (
                <span className="text-[10px] uppercase tracking-wider bg-white/10 text-white/50 px-2 py-0.5 rounded-full">
                  Coming soon
                </span>
              )}
            </h4>
            <p className="text-sm text-white/50 mt-1">{item.description}</p>
          </div>
          <Toggle
            checked={preferences?.[item.id] ?? true}
            onChange={() => handleToggle(item.id, !(preferences?.[item.id] ?? true))}
            disabled={item.disabled}
          />
        </div>
      ))}
    </div>
  );
};

export default NotificationPreferences;
