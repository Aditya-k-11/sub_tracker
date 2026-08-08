import SpendSnapshot from '../models/SpendSnapshot.js';
import Subscription from '../models/Subscription.js';
import { normalizeToMonthly } from '../utils/normalizeToMonthly.js';

export const upsertCurrentMonthSnapshot = async (userId, monthOverride = null) => {
  const currentMonth = monthOverride || new Date().toISOString().substring(0, 7);
  
  const subscriptions = await Subscription.find({ userId, status: 'active' });
  
  let totalSpend = 0;
  const totalByCategory = {};
  
  subscriptions.forEach(sub => {
    const monthlyCost = normalizeToMonthly(sub.cost, sub.billingCycle, sub.billingCycleInterval);
    totalSpend += monthlyCost;
    
    if (!totalByCategory[sub.category]) {
      totalByCategory[sub.category] = 0;
    }
    totalByCategory[sub.category] += monthlyCost;
  });
  
  totalSpend = Math.round(totalSpend * 100) / 100;
  for (const cat in totalByCategory) {
    totalByCategory[cat] = Math.round(totalByCategory[cat] * 100) / 100;
  }
  
  const snapshot = await SpendSnapshot.findOneAndUpdate(
    { userId, month: currentMonth },
    { totalSpend, totalByCategory },
    { upsert: true, new: true }
  );
  
  return snapshot;
};
