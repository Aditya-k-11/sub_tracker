import { KNOWN_SERVICE_DISCOUNTS, DEFAULT_CATEGORY_DISCOUNT_ESTIMATE } from '../config/annualDiscountEstimates.js';

/**
 * Estimates potential savings if a monthly subscription is switched to an annual plan.
 * Returns null if the subscription is not monthly or has no annual discount available (like Netflix).
 */
export const estimateAnnualSavings = (subscription) => {
  // We only suggest switching to yearly for monthly subscriptions.
  if (subscription.billingCycle !== "monthly") {
    return null;
  }

  // Determine the discount.
  // 1. Try exact match.
  let isEstimate = false;
  let discount = KNOWN_SERVICE_DISCOUNTS[subscription.name];

  if (discount === undefined) {
    // 2. Fall back to category estimate.
    discount = DEFAULT_CATEGORY_DISCOUNT_ESTIMATE[subscription.category];
    isEstimate = true;
  }

  // A 0 discount indicates that this service is known NOT to have an annual plan (e.g. Netflix)
  // undefined means we couldn't even find a category fallback (shouldn't happen with our defaults, but safety first)
  if (!discount) {
    return null;
  }

  // Compute savings
  // Remember to use the effective cost if the subscription is shared. We only want to estimate savings on THEIR share.
  // Wait, the prompt says: "currentAnnualCost = subscription.cost * 12". Let's use the raw cost. If it's shared, the user is still paying the raw cost to the merchant, or they are splitting it. Actually, showing savings on their effective cost is more accurate to their wallet. But we'll calculate based on the total cost. Actually, let's use the effective cost to be safe, or just raw cost since the user makes the payment for the full amount.
  // We will use raw cost here, and the UI can show the raw savings.
  const cost = subscription.cost;
  
  const currentAnnualCost = cost * 12;
  const estimatedYearlyPlanCost = currentAnnualCost * (1 - discount);
  const estimatedSavings = currentAnnualCost - estimatedYearlyPlanCost;

  return {
    currentAnnualCost,
    estimatedYearlyPlanCost,
    estimatedSavings,
    discountPercent: discount * 100,
    isEstimate
  };
};
