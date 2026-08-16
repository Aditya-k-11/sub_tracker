import Subscription from '../models/Subscription.js';
import UsageLog from '../models/UsageLog.js';
import User from '../models/User.js';
import { daysSince } from '../utils/dateHelpers.js';
import { WASTE_THRESHOLD_DAYS, MIN_SUBSCRIPTION_AGE_DAYS } from '../config/wasteDetection.js';
import { HIGH_CATEGORY_SPEND_THRESHOLD } from '../config/insightsConfig.js';
import { getEffectiveMonthlyCost } from '../utils/effectiveCost.js';
import { findUpcomingRenewals } from './renewalScanService.js';
import { exchangeRateService } from './exchangeRateService.js';
import { estimateAnnualSavings } from '../utils/annualSavingsCalculator.js';

const convertCurrency = async (amount, fromCurrency, toCurrency) => {
  if (fromCurrency === toCurrency) return amount;
  try {
    const rates = await exchangeRateService.getCachedExchangeRates(fromCurrency);
    const rateToTarget = rates[toCurrency];
    return rateToTarget ? amount * rateToTarget : amount;
  } catch (err) {
    return amount;
  }
};

const getTargetCurrency = async (userId) => {
  const user = await User.findById(userId);
  return user?.currency || 'USD';
};

const formatCurrencyString = (amount, currencyCode) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode }).format(amount);
};

export const analyzeWastedSpend = async (userId) => {
  const subscriptions = await Subscription.find({ 
    userId, 
    status: 'active' 
  });
  
  const targetCurrency = await getTargetCurrency(userId);
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
      const costInTarget = await convertCurrency(sub.cost, sub.currency || 'USD', targetCurrency);
      const monthlyCost = getEffectiveMonthlyCost(sub, costInTarget);
      
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
        monthlyCost: Math.round(monthlyCost * 100) / 100,
        daysSinceLastUse,
        totalUsageCount,
        costPerUse,
        reason,
        currency: targetCurrency
      });
    }
  }
  
  flaggedSubscriptions.sort((a, b) => b.daysSinceLastUse - a.daysSinceLastUse);
  
  return flaggedSubscriptions;
};

const getWastedSpendInsights = async (userId, targetCurrency) => {
  const flagged = await analyzeWastedSpend(userId);
  
  return flagged.map(item => ({
    id: `wasted:${item.subscriptionId}`,
    type: 'wasted_spend',
    priority: item.daysSinceLastUse,
    title: `You're not using ${item.name}`,
    description: `${item.reason} — costing ${formatCurrencyString(item.monthlyCost, targetCurrency)}/month`,
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
    const trialEnd = new Date(trial.trialEndDate);
    const diffTime = trialEnd.getTime() - today.getTime();
    const daysUntilEnd = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    
    const urgencyScore = 1000 - (daysUntilEnd * 10);
    
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

const getHighCategorySpendInsights = async (userId, targetCurrency) => {
  const subscriptions = await Subscription.find({ 
    userId, 
    status: 'active' 
  });
  
  const categoryMap = {};
  
  for (const sub of subscriptions) {
    const costInTarget = await convertCurrency(sub.cost, sub.currency || 'USD', targetCurrency);
    const monthlyCost = getEffectiveMonthlyCost(sub, costInTarget);
    
    if (!categoryMap[sub.category]) {
      categoryMap[sub.category] = {
        category: sub.category,
        monthlySpend: 0,
        count: 0
      };
    }
    
    categoryMap[sub.category].monthlySpend += monthlyCost;
    categoryMap[sub.category].count++;
  }
  
  const insights = [];
  
  for (const cat of Object.values(categoryMap)) {
    if (cat.count >= HIGH_CATEGORY_SPEND_THRESHOLD) {
      insights.push({
        id: `high-category:${cat.category}`,
        type: 'high_category_spend',
        priority: cat.count * 50,
        title: `High overlap in ${cat.category}`,
        description: `You have ${cat.count} ${cat.category} subscriptions totaling ${formatCurrencyString(cat.monthlySpend, targetCurrency)}/month — consider reviewing for overlap.`,
        actionLabel: 'View category',
        actionType: 'view_category',
        actionTarget: cat.category
      });
    }
  }
  
  return insights;
};

const getPriceChangeInsights = async (userId, targetCurrency) => {
  const subscriptions = await Subscription.find({ 
    userId, 
    status: 'active' 
  });
  
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const insights = [];
  
  for (const sub of subscriptions) {
    if (sub.costHistory && sub.costHistory.length > 0) {
      const mostRecentChange = sub.costHistory[sub.costHistory.length - 1];
      
      // If changed within last 30 days and cost INCREASED
      if (mostRecentChange.changedAt > thirtyDaysAgo && sub.cost > mostRecentChange.cost) {
        const oldCostInTarget = await convertCurrency(mostRecentChange.cost, sub.currency || 'USD', targetCurrency);
        const newCostInTarget = await convertCurrency(sub.cost, sub.currency || 'USD', targetCurrency);
        
        const oldStr = formatCurrencyString(oldCostInTarget, targetCurrency);
        const newStr = formatCurrencyString(newCostInTarget, targetCurrency);
        const percentIncrease = ((sub.cost - mostRecentChange.cost) / mostRecentChange.cost) * 100;
        
        // Priority scaled by % increase. Up to 100
        const priority = Math.min(100, Math.max(30, percentIncrease * 2));
        
        const dateStr = mostRecentChange.changedAt.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
        
        insights.push({
          id: `price_increase_${sub._id}_${mostRecentChange.changedAt.getTime()}`,
          type: 'price_increase',
          priority,
          title: `${sub.name} price increased`,
          description: `${oldStr} → ${newStr} on ${dateStr}`,
          actionType: 'view_subscription',
          actionTarget: sub._id
        });
      }
    }
  }
  
  return insights;
};

const getSavingsInsights = async (userId, targetCurrency) => {
  const subscriptions = await Subscription.find({ 
    userId, 
    status: 'active',
    billingCycle: 'monthly'
  });
  
  const insights = [];
  
  for (const sub of subscriptions) {
    const savingsEstimate = estimateAnnualSavings(sub);
    if (savingsEstimate && savingsEstimate.estimatedSavings > 0) {
      const savingsInTarget = await convertCurrency(savingsEstimate.estimatedSavings, sub.currency || 'USD', targetCurrency);
      
      // Threshold: Don't show trivial savings (e.g. less than 12 in their currency per year)
      if (savingsInTarget > 12) {
        const priority = Math.min(100, Math.max(20, Math.round(savingsInTarget / 5)));
        const savingsStr = formatCurrencyString(savingsInTarget, targetCurrency);
        
        insights.push({
          id: `annual_savings_${sub._id}`,
          type: 'annual_savings',
          priority,
          title: `Save on ${sub.name} with annual billing`,
          description: `Switching to yearly could save you ~${savingsStr}/year`,
          actionLabel: 'View options',
          actionType: 'view_subscription',
          actionTarget: sub._id
        });
      }
    }
  }
  
  return insights;
};

export const generateInsights = async (userId) => {
  const targetCurrency = await getTargetCurrency(userId);
  const [wastedSpend, trialEnding, highCategorySpend, priceChange, savings] = await Promise.all([
    getWastedSpendInsights(userId, targetCurrency),
    getTrialEndingInsights(userId),
    getHighCategorySpendInsights(userId, targetCurrency),
    getPriceChangeInsights(userId, targetCurrency),
    getSavingsInsights(userId, targetCurrency)
  ]);
  
  let allInsights = [...wastedSpend, ...trialEnding, ...highCategorySpend, ...priceChange, ...savings];
  allInsights.sort((a, b) => b.priority - a.priority);
  
  return allInsights;
};
