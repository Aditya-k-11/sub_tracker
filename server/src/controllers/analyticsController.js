import Subscription from '../models/Subscription.js';
import User from '../models/User.js';
import catchAsync from '../utils/catchAsync.js';
import { getEffectiveMonthlyCost } from '../utils/effectiveCost.js';
import { upsertCurrentMonthSnapshot } from '../services/snapshotService.js';
import SpendSnapshot from '../models/SpendSnapshot.js';
import UsageLog from '../models/UsageLog.js';
import { daysSince, getDayLabel } from '../utils/dateHelpers.js';
import { WASTE_THRESHOLD_DAYS, MIN_SUBSCRIPTION_AGE_DAYS } from '../config/wasteDetection.js';
import { analyzeWastedSpend, generateInsights } from '../services/insightsEngine.js';
import { HIGH_CATEGORY_SPEND_THRESHOLD } from '../config/insightsConfig.js';
import { currencyService } from '../services/currencyService.js';

const getTargetCurrency = async (userId) => {
  const user = await User.findById(userId);
  return user?.currency || 'USD';
};

export const getSpendSummary = catchAsync(async (req, res, next) => {
  const subscriptions = await Subscription.find({ 
    userId: req.user.id, 
    status: 'active' 
  });
  
  const targetCurrency = await getTargetCurrency(req.user.id);
  
  let totalMonthlySpend = 0;
  let trialCount = 0;
  
  for (const sub of subscriptions) {
    const costInTarget = await currencyService.convert(sub.cost, sub.currency || 'USD', targetCurrency);
    totalMonthlySpend += getEffectiveMonthlyCost(sub, costInTarget);
    if (sub.isTrial) {
      trialCount++;
    }
  }
  
  totalMonthlySpend = Math.round(totalMonthlySpend * 100) / 100;
  const totalYearlySpend = Math.round(totalMonthlySpend * 12 * 100) / 100;
  
  try {
    await upsertCurrentMonthSnapshot(req.user.id);
  } catch (err) {
    console.warn('Failed to upsert current month snapshot during getSpendSummary:', err.message);
  }
  
  res.status(200).json({
    totalMonthlySpend,
    totalYearlySpend,
    activeSubscriptionCount: subscriptions.length,
    trialCount,
    currency: targetCurrency
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
  
  for (const sub of subscriptions) {
    const costInTarget = await currencyService.convert(sub.cost, sub.currency || 'USD', targetCurrency);
    const monthlyCost = getEffectiveMonthlyCost(sub, costInTarget);
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
  }
  
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
  for (const s of snapshots) {
    const spendInTarget = await currencyService.convert(s.totalSpend, 'USD', targetCurrency); // Snapshots historically assume USD base unless tracking snapshot currency. Let's assume snapshot totalSpend acts as base.
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
  for (const sub of flaggedSubscriptions) {
    // analyzeWastedSpend already returns sub, but monthlyCost is calculated in insightEngine. We'll recalculate here for simplicity and accuracy in target currency
    const costInTarget = await currencyService.convert(sub.cost, sub.currency || 'USD', targetCurrency);
    sub.monthlyCost = getEffectiveMonthlyCost(sub, costInTarget);
    potentialMonthlySavings += sub.monthlyCost;
  }
  
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

  for (const sub of subscriptions) {
    const relevantDate = sub.isTrial ? sub.trialEndDate : sub.nextRenewalDate;
    if (!relevantDate) continue;
    
    const d = new Date(relevantDate);
    d.setHours(0, 0, 0, 0);
    const dateStr = d.toISOString().split('T')[0];
    
    if (daysMap[dateStr]) {
      const costInTarget = await currencyService.convert(sub.cost, sub.currency || 'USD', targetCurrency);
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
  }

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

  for (const sub of subscriptions) {
    const costInTarget = await currencyService.convert(sub.cost, sub.currency || 'USD', targetCurrency);
    const normalizedMonthly = getEffectiveMonthlyCost(sub, costInTarget);
    projectedMonthEnd += normalizedMonthly;
    
    // Check if it already renewed this month
    let hasRenewedThisMonth = false;
    
    if (sub.nextRenewalDate) {
      const renewalDate = new Date(sub.nextRenewalDate);
      if (renewalDate > today) {
        // Renewal is in the future. Was there a renewal this month already?
        // E.g. next renewal is Aug 25, today is Aug 15. Then yes, it will renew this month. Wait, if it's Aug 25, it HASN'T renewed yet this month.
        // If next renewal is Sep 5, and today is Aug 15. Then it MUST have renewed on Aug 5.
        if (renewalDate.getMonth() > month || renewalDate.getFullYear() > year) {
          hasRenewedThisMonth = true;
        }
      }
    }

    if (hasRenewedThisMonth) {
      monthToDateSpend += normalizedMonthly;
    }
  }

  const prevMonthDate = new Date(year, month - 1, 1);
  const prevMonthStr = prevMonthDate.getFullYear() + '-' + String(prevMonthDate.getMonth() + 1).padStart(2, '0');
  
  const lastSnapshot = await SpendSnapshot.findOne({ userId: req.user.id, month: prevMonthStr });
  
  let percentChangeVsLastMonth = null;
  let trend = 'unknown';
  let lastMonthActual = null;

  if (lastSnapshot) {
    const spendInTarget = await currencyService.convert(lastSnapshot.totalSpend, 'USD', targetCurrency);
    lastMonthActual = spendInTarget;
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
  for (const sub of subscriptions) {
    const costInTarget = await currencyService.convert(sub.cost, sub.currency || 'USD', targetCurrency);
    totalMonthlySpend += getEffectiveMonthlyCost(sub, costInTarget);
    
    // Convert the subscription cost so the frontend displays it correctly?
    // Wait, earlier I decided the frontend handles formatting using `subscription.currency`.
    // But CategoryDetailPage doesn't use `SubscriptionCard`! It renders an `AreaChart`.
    // Wait, yes it does use SubscriptionCard! Let's just leave `sub.cost` untouched so the frontend shows it in its native currency!
  }
  
  const snapshots = await SpendSnapshot.find({ userId: req.user.id }).sort({ month: 1 }).lean();
  
  const categoryTrend = [];
  for (const snapshot of snapshots) {
    const monthLabel = snapshot.month;
    let categorySpend = 0;
    
    if (snapshot.totalByCategory && snapshot.totalByCategory[category]) {
      const spendInTarget = await currencyService.convert(snapshot.totalByCategory[category], 'USD', targetCurrency);
      categorySpend = spendInTarget;
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
