import Subscription from '../models/Subscription.js';
import UsageLog from '../models/UsageLog.js';
import { daysSince } from '../utils/dateHelpers.js';
import { WASTE_THRESHOLD_DAYS, MIN_SUBSCRIPTION_AGE_DAYS } from '../config/wasteDetection.js';
import { HIGH_CATEGORY_SPEND_THRESHOLD } from '../config/insightsConfig.js';
import { normalizeToMonthly } from '../utils/normalizeToMonthly.js';
import { findUpcomingRenewals } from './renewalScanService.js';

export const analyzeWastedSpend = async (userId) => {
  const subscriptions = await Subscription.find({ 
    userId, 
    status: 'active' 
  });
  
  const flaggedSubscriptions = [];
  
  for (const sub of subscriptions) {
    const ageInDays = daysSince(sub.createdAt);
    if (ageInDays < MIN_SUBSCRIPTION_AGE_DAYS) {
      continue;
    }
    
    const recentLog = await UsageLog.findOne({ subscriptionId: sub._id }).sort({ usedAt: -1 });
    
    let daysSinceLastUse;
    let totalUsageCount = 0;
    
    if (recentLog) {
      daysSinceLastUse = daysSince(recentLog.usedAt);
      totalUsageCount = await UsageLog.countDocuments({ subscriptionId: sub._id });
    } else {
      daysSinceLastUse = ageInDays;
    }
    
    if (daysSinceLastUse >= WASTE_THRESHOLD_DAYS) {
      const monthlyCost = normalizeToMonthly(sub.cost, sub.billingCycle, sub.billingCycleInterval);
      
      let costPerUse = null;
      let reason = '';
      
      if (totalUsageCount > 0) {
        const monthsSinceCreated = Math.max(1, ageInDays / 30);
        costPerUse = Math.round(((monthlyCost * monthsSinceCreated) / totalUsageCount) * 100) / 100;
        reason = `No usage logged in ${daysSinceLastUse} days`;
      } else {
        reason = `Never logged as used since created ${daysSinceLastUse} days ago`;
      }
      
      flaggedSubscriptions.push({
        subscriptionId: sub._id,
        name: sub.name,
        category: sub.category,
        monthlyCost,
        daysSinceLastUse,
        totalUsageCount,
        costPerUse,
        reason
      });
    }
  }
  
  flaggedSubscriptions.sort((a, b) => b.daysSinceLastUse - a.daysSinceLastUse);
  
  return flaggedSubscriptions;
};

const getWastedSpendInsights = async (userId) => {
  const flagged = await analyzeWastedSpend(userId);
  
  return flagged.map(item => ({
    id: `wasted:${item.subscriptionId}`,
    type: 'wasted_spend',
    priority: item.daysSinceLastUse, // Higher days = higher priority
    title: `You're not using ${item.name}`,
    description: `${item.reason} — costing ₹${item.monthlyCost}/month`,
    actionLabel: 'Log usage',
    actionType: 'log_usage',
    actionTarget: item.subscriptionId
  }));
};

const getTrialEndingInsights = async (userId) => {
  const upcoming = await findUpcomingRenewals(userId);
  const trials = upcoming.filter(sub => sub.isTrial);
  const today = new Date();
  
  return trials.map(trial => {
    // We compute days left carefully to ensure positive value.
    const trialEnd = new Date(trial.trialEndDate);
    const diffTime = trialEnd.getTime() - today.getTime();
    const daysUntilEnd = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    
    const urgencyScore = 1000 - (daysUntilEnd * 10); // Very high base priority, drops as days increase
    
    return {
      id: `trial-ending:${trial._id}`,
      type: 'trial_ending',
      priority: urgencyScore,
      title: `${trial.name} trial is ending`,
      description: `Trial ends in ${daysUntilEnd} days. Review it before you're charged.`,
      actionLabel: 'Review subscription',
      actionType: 'view_subscription',
      actionTarget: trial._id
    };
  });
};

const getHighCategorySpendInsights = async (userId) => {
  const subscriptions = await Subscription.find({ 
    userId, 
    status: 'active' 
  });
  
  const categoryMap = {};
  
  subscriptions.forEach(sub => {
    const monthlyCost = normalizeToMonthly(sub.cost, sub.billingCycle, sub.billingCycleInterval);
    
    if (!categoryMap[sub.category]) {
      categoryMap[sub.category] = {
        category: sub.category,
        monthlySpend: 0,
        count: 0
      };
    }
    
    categoryMap[sub.category].monthlySpend += monthlyCost;
    categoryMap[sub.category].count++;
  });
  
  const insights = [];
  
  for (const cat of Object.values(categoryMap)) {
    if (cat.count >= HIGH_CATEGORY_SPEND_THRESHOLD) {
      const formattedSpend = Math.round(cat.monthlySpend).toLocaleString();
      insights.push({
        id: `high-category:${cat.category}`,
        type: 'high_category_spend',
        priority: cat.count * 50, // Priority scaled by subscription count
        title: `High overlap in ${cat.category}`,
        description: `You have ${cat.count} ${cat.category} subscriptions totaling ₹${formattedSpend}/month — consider reviewing for overlap.`,
        actionLabel: 'View category',
        actionType: 'view_category',
        actionTarget: cat.category
      });
    }
  }
  
  return insights;
};

// Extension Point: Future insight types (e.g., price-change detection, annual/monthly savings suggestions)
// will be added here as new `get*Insights(userId)` source functions following the exact same pattern.
export const generateInsights = async (userId) => {
  const [wastedSpend, trialEnding, highCategorySpend] = await Promise.all([
    getWastedSpendInsights(userId),
    getTrialEndingInsights(userId),
    getHighCategorySpendInsights(userId)
  ]);
  
  const allInsights = [...wastedSpend, ...trialEnding, ...highCategorySpend];
  
  // Sort descending by priority
  allInsights.sort((a, b) => b.priority - a.priority);
  
  return allInsights;
};
