import Subscription from '../models/Subscription.js';
import User from '../models/User.js';
import catchAsync from '../utils/catchAsync.js';
import { getEffectiveMonthlyCost, getEffectiveMonthlyCostInCurrency } from '../utils/effectiveCost.js';
import { upsertCurrentMonthSnapshot } from '../services/snapshotService.js';
import SpendSnapshot from '../models/SpendSnapshot.js';
import UsageLog from '../models/UsageLog.js';
import { daysSince, getDayLabel } from '../utils/dateHelpers.js';
import { WASTE_THRESHOLD_DAYS, MIN_SUBSCRIPTION_AGE_DAYS } from '../config/wasteDetection.js';
import { analyzeWastedSpend, generateInsights } from '../services/insightsEngine.js';
import { HIGH_CATEGORY_SPEND_THRESHOLD } from '../config/insightsConfig.js';
import { exchangeRateService } from '../services/exchangeRateService.js';

const getTargetCurrency = async (userId) => {
  const user = await User.findById(userId);
  return user?.currency || 'USD';
};

export const getSpendSummary = catchAsync(async (req, res, next) => {
  const subscriptions = await Subscription.find({ 
    userId: req.user.id, 
    status: 'active' 
  });
  
  const user = await User.findById(req.user.id);
  const targetCurrency = user?.currency || 'USD';
  const monthlyBudget = user?.monthlyBudget || null;
  
  let totalMonthlySpend = 0;
  let trialCount = 0;
  let trialCount = 0;
  
  const costPromises = subscriptions.map(sub => getEffectiveMonthlyCostInCurrency(sub, targetCurrency));
  const convertedCosts = await Promise.all(costPromises);

  subscriptions.forEach((sub, index) => {
    totalMonthlySpend += convertedCosts[index];
    if (sub.isTrial) {
      trialCount++;
    }
  });
  
  totalMonthlySpend = Math.round(totalMonthlySpend * 100) / 100;
  const totalYearlySpend = Math.round(totalMonthlySpend * 12 * 100) / 100;
  
  try {
    await upsertCurrentMonthSnapshot(req.user.id);
  } catch (err) {
    console.warn('Failed to upsert current month snapshot during getSpendSummary:', err.message);
  }
  
  let budgetUsedPercentage = null;
  if (monthlyBudget !== null && monthlyBudget > 0) {
    budgetUsedPercentage = Math.round((totalMonthlySpend / monthlyBudget) * 100);
  }

  res.status(200).json({
    totalMonthlySpend,
    totalYearlySpend,
    activeSubscriptionCount: subscriptions.length,
    trialCount,
    currency: targetCurrency,
    monthlyBudget,
    budgetUsedPercentage
  });
});

export const getCategoryBreakdown = catchAsync(async (req, res, next) => {
  const subscriptions = await Subscription.find({ 
    userId: req.user.id, 
    status: 'active' 
  });
  
  const targetCurrency = await getTargetCurrency(req.user.id);
  let totalMonthlySpend = 0;
  const categoryMap = {};
  const costPromises = subscriptions.map(sub => getEffectiveMonthlyCostInCurrency(sub, targetCurrency));
  const convertedCosts = await Promise.all(costPromises);

  subscriptions.forEach((sub, index) => {
    const monthlyCost = convertedCosts[index];
    totalMonthlySpend += monthlyCost;
    
    if (!categoryMap[sub.category]) {
      categoryMap[sub.category] = {
        category: sub.category,
        monthlySpend: 0,
        subscriptionCount: 0
      };
    }
    
    categoryMap[sub.category].monthlySpend += monthlyCost;
    categoryMap[sub.category].subscriptionCount++;
  });
  
  const categories = Object.values(categoryMap).map(cat => ({
    ...cat,
    monthlySpend: Math.round(cat.monthlySpend * 100) / 100
  })).sort((a, b) => b.monthlySpend - a.monthlySpend);
  
  totalMonthlySpend = Math.round(totalMonthlySpend * 100) / 100;
  
  try {
    await upsertCurrentMonthSnapshot(req.user.id);
  } catch (err) {
    console.warn('Failed to upsert current month snapshot during getCategoryBreakdown:', err.message);
  }
  
  res.status(200).json({
    categories,
    totalMonthlySpend,
    currency: targetCurrency
  });
});

export const getSpendTrend = catchAsync(async (req, res, next) => {
  const snapshots = await SpendSnapshot.find({ userId: req.user.id }).sort({ month: 1 });
  const targetCurrency = await getTargetCurrency(req.user.id);
  
  const trend = [];
  const rates = await exchangeRateService.getCachedExchangeRates('USD');
  const rateToTarget = rates[targetCurrency] || 1;

  for (const s of snapshots) {
    const spendInTarget = s.totalSpend * rateToTarget;
    trend.push({
      month: s.month,
      totalSpend: Math.round(spendInTarget * 100) / 100
    });
  }

  res.status(200).json({ trend, currency: targetCurrency });
});

export const getWastedSpend = catchAsync(async (req, res, next) => {
  const flaggedSubscriptions = await analyzeWastedSpend(req.user.id);
  const targetCurrency = await getTargetCurrency(req.user.id);
  
  let potentialMonthlySavings = 0;
  const costPromises = flaggedSubscriptions.map(sub => getEffectiveMonthlyCostInCurrency(sub, targetCurrency));
  const convertedCosts = await Promise.all(costPromises);

  flaggedSubscriptions.forEach((sub, index) => {
    sub.monthlyCost = convertedCosts[index];
    potentialMonthlySavings += sub.monthlyCost;
  });
  
  potentialMonthlySavings = Math.round(potentialMonthlySavings * 100) / 100;
  
  res.status(200).json({
    flaggedSubscriptions,
    potentialMonthlySavings,
    currency: targetCurrency
  });
});

export const getInsights = catchAsync(async (req, res, next) => {
  const insights = await generateInsights(req.user.id);
  // generateInsights doesn't strictly depend on currency unless it returns numbers. Currently insights have strings.
  // We'll leave it as is or handle inside insightsEngine.
  res.status(200).json({
    insights,
    count: insights.length
  });
});

export const getUpcomingPaymentsTimeline = catchAsync(async (req, res, next) => {
  const subscriptions = await Subscription.find({ 
    userId: req.user.id, 
    status: 'active' 
  });

  const targetCurrency = await getTargetCurrency(req.user.id);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const daysMap = {};
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    
    daysMap[dateStr] = {
      date: dateStr,
      dayLabel: getDayLabel(d, today),
      subscriptions: [],
      totalCost: 0
    };
  }

  let totalUpcoming14Days = 0;

  const costPromises = subscriptions.map(sub => {
    const ratesPromise = exchangeRateService.getCachedExchangeRates(sub.currency || 'USD');
    return ratesPromise.then(rates => {
      const rateToTarget = rates[targetCurrency] || 1;
      return sub.cost * rateToTarget;
    }).catch(() => sub.cost); // fallback
  });
  const rawCostsInTarget = await Promise.all(costPromises);

  subscriptions.forEach((sub, index) => {
    const relevantDate = sub.isTrial ? sub.trialEndDate : sub.nextRenewalDate;
    if (!relevantDate) return;
    
    const d = new Date(relevantDate);
    d.setHours(0, 0, 0, 0);
    const dateStr = d.toISOString().split('T')[0];
    
    if (daysMap[dateStr]) {
      const costInTarget = rawCostsInTarget[index];
      daysMap[dateStr].subscriptions.push({
        subscriptionId: sub._id,
        name: sub.name,
        cost: costInTarget,
        category: sub.category,
        isTrial: sub.isTrial
      });
      daysMap[dateStr].totalCost += costInTarget;
      totalUpcoming14Days += costInTarget;
    }
  });

  const days = Object.values(daysMap).sort((a, b) => new Date(a.date) - new Date(b.date));

  res.status(200).json({
    days,
    totalUpcoming14Days: Math.round(totalUpcoming14Days * 100) / 100,
    currency: targetCurrency
  });
});

export const getSpendingVelocity = catchAsync(async (req, res, next) => {
  const subscriptions = await Subscription.find({ 
    userId: req.user.id, 
    status: 'active' 
  });

  const targetCurrency = await getTargetCurrency(req.user.id);
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  const dayOfMonth = today.getDate();
  const daysRemaining = totalDaysInMonth - dayOfMonth;
  
  let monthToDateSpend = 0;
  let projectedMonthEnd = 0;

  const firstDayOfMonth = new Date(year, month, 1);

  const costPromises = subscriptions.map(sub => getEffectiveMonthlyCostInCurrency(sub, targetCurrency));
  const convertedCosts = await Promise.all(costPromises);

  subscriptions.forEach((sub, index) => {
    const normalizedMonthly = convertedCosts[index];
    projectedMonthEnd += normalizedMonthly;
    
    // Check if it already renewed this month
    let hasRenewedThisMonth = false;
    
    if (sub.nextRenewalDate) {
      const renewalDate = new Date(sub.nextRenewalDate);
      if (renewalDate > today) {
        if (renewalDate.getMonth() > month || renewalDate.getFullYear() > year) {
          hasRenewedThisMonth = true;
        }
      }
    }

    if (hasRenewedThisMonth) {
      monthToDateSpend += normalizedMonthly;
    }
  });

  const prevMonthDate = new Date(year, month - 1, 1);
  const prevMonthStr = prevMonthDate.getFullYear() + '-' + String(prevMonthDate.getMonth() + 1).padStart(2, '0');
  
  const lastSnapshot = await SpendSnapshot.findOne({ userId: req.user.id, month: prevMonthStr });
  
  let percentChangeVsLastMonth = null;
  let trend = 'unknown';
  let lastMonthActual = null;

  if (lastSnapshot) {
    const rates = await exchangeRateService.getCachedExchangeRates('USD');
    const rateToTarget = rates[targetCurrency] || 1;
    lastMonthActual = lastSnapshot.totalSpend * rateToTarget;
    if (lastMonthActual > 0) {
      percentChangeVsLastMonth = ((projectedMonthEnd - lastMonthActual) / lastMonthActual) * 100;
      percentChangeVsLastMonth = Math.round(percentChangeVsLastMonth * 10) / 10;
      
      if (percentChangeVsLastMonth > 2) {
        trend = 'up';
      } else if (percentChangeVsLastMonth < -2) {
        trend = 'down';
      } else {
        trend = 'flat';
      }
    }
  }

  res.status(200).json({
    monthToDateSpend: Math.round(monthToDateSpend * 100) / 100,
    projectedMonthEnd: Math.round(projectedMonthEnd * 100) / 100,
    daysElapsed: dayOfMonth,
    daysRemaining,
    lastMonthActual: lastMonthActual !== null ? Math.round(lastMonthActual * 100) / 100 : null,
    percentChangeVsLastMonth,
    trend,
    currency: targetCurrency
  });
});
export const getCategoryDetail = catchAsync(async (req, res, next) => {
  const { category } = req.params;
  
  const subscriptions = await Subscription.find({
    userId: req.user.id,
    category,
    status: 'active'
  }).lean();
  
  const targetCurrency = await getTargetCurrency(req.user.id);
  
  let totalMonthlySpend = 0;
  const costPromises = subscriptions.map(sub => getEffectiveMonthlyCostInCurrency(sub, targetCurrency));
  const convertedCosts = await Promise.all(costPromises);

  subscriptions.forEach((sub, index) => {
    totalMonthlySpend += convertedCosts[index];
  });
  
  const snapshots = await SpendSnapshot.find({ userId: req.user.id }).sort({ month: 1 }).lean();
  
  const categoryTrend = [];
  for (const snapshot of snapshots) {
    const monthLabel = snapshot.month;
    let categorySpend = 0;
    
    if (snapshot.totalByCategory && snapshot.totalByCategory[category]) {
      const rates = await exchangeRateService.getCachedExchangeRates('USD');
      const rateToTarget = rates[targetCurrency] || 1;
      categorySpend = snapshot.totalByCategory[category] * rateToTarget;
    }
    
    categoryTrend.push({
      month: monthLabel,
      categorySpend: Math.round(categorySpend * 100) / 100
    });
  }
  
  const subscriptionCount = subscriptions.length;
  const overlapWarning = subscriptionCount >= HIGH_CATEGORY_SPEND_THRESHOLD;
  
  res.status(200).json({
    category,
    subscriptions,
    totalMonthlySpend: Math.round(totalMonthlySpend * 100) / 100,
    subscriptionCount,
    categoryTrend,
    overlapWarning,
    currency: targetCurrency
  });
});
