export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 2
  }).format(amount);
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(new Date(dateString));
};

export const daysUntil = (dateString) => {
  if (!dateString) return 0;
  const target = new Date(dateString);
  const now = new Date();

  target.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  
  const diffTime = target - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const billingCycleLabel = (cycle, interval = 1) => {
  if (!cycle) return '';
  const c = cycle.toLowerCase();
  
  if (interval === 1) {
    if (c === 'weekly') return 'Weekly';
    if (c === 'monthly') return 'Monthly';
    if (c === 'yearly') return 'Yearly';
  } else {
    if (c === 'weekly') return `Every ${interval} weeks`;
    if (c === 'monthly') return `Every ${interval} months`;
    if (c === 'yearly') return `Every ${interval} years`;
  }
  return cycle.charAt(0).toUpperCase() + cycle.slice(1);
};
