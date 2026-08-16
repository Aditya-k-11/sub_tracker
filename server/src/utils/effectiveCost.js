import { normalizeToMonthly } from './normalizeToMonthly.js';

/**
 * Returns the cost divided by the number of people sharing the subscription.
 * Defaults to dividing by 1 if sharedWithCount is missing.
 */
export const getEffectiveCost = (subscription, overrideCost = null) => {
  if (!subscription) return 0;
  const baseCost = overrideCost !== null ? overrideCost : (subscription.cost || 0);
  const shareCount = subscription.sharedWithCount || 1;
  return baseCost / shareCount;
};

/**
 * Returns the effective cost normalized to a monthly value based on the billing cycle.
 * This is the new centralized calculation for all analytics endpoints.
 */
export const getEffectiveMonthlyCost = (subscription, overrideCost = null) => {
  if (!subscription) return 0;
  
  const effectiveCost = getEffectiveCost(subscription, overrideCost);
  return normalizeToMonthly(effectiveCost, subscription.billingCycle, subscription.billingCycleInterval);
};
