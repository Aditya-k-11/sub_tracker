export const normalizeToMonthly = (cost, billingCycle, interval = 1) => {
  let monthlyCost;
  
  if (billingCycle === 'weekly') {
    monthlyCost = cost * 4.345;
  } else if (billingCycle === 'yearly') {
    monthlyCost = cost / 12;
  } else {
    
    monthlyCost = cost;
  }

  const normalized = monthlyCost / Math.max(1, interval);
  
  return Math.round(normalized * 100) / 100;
};
