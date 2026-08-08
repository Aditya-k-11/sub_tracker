import Subscription from '../models/Subscription.js';
import catchAsync from '../utils/catchAsync.js';
import { normalizeToMonthly } from '../utils/normalizeToMonthly.js';
import { upsertCurrentMonthSnapshot } from '../services/snapshotService.js';
import SpendSnapshot from '../models/SpendSnapshot.js';
import UsageLog from '../models/UsageLog.js';
import { daysSince, getDayLabel } from '../utils/dateHelpers.js';
import { WASTE_THRESHOLD_DAYS, MIN_SUBSCRIPTION_AGE_DAYS } from '../config/wasteDetection.js';

export const getSpendSummary = catchAsync(async (req, res, next) => {
  const subscriptions = await Subscription.find({ 
    userId: req.user.id, 
    status: 'active' 
  });
  
  let totalMonthlySpend = 0;
  let trialCount = 0;
  
  subscriptions.forEach(sub => {
    totalMonthlySpend += normalizeToMonthly(sub.cost, sub.billingCycle, sub.billingCycleInterval);
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
  
  res.status(200).json({
    totalMonthlySpend,
    totalYearlySpend,
    activeSubscriptionCount: subscriptions.length,
    trialCount
  });
});

export const getCategoryBreakdown = catchAsync(async (req, res, next) => {
  const subscriptions = await Subscription.find({ 
    userId: req.user.id, 
    status: 'active' 
  });
  
  let totalMonthlySpend = 0;
  const categoryMap = {};
  
  subscriptions.forEach(sub => {
    const monthlyCost = normalizeToMonthly(sub.cost, sub.billingCycle, sub.billingCycleInterval);
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
    totalMonthlySpend
  });
});

export const getSpendTrend = catchAsync(async (req, res, next) => {
  const snapshots = await SpendSnapshot.find({ userId: req.user.id }).sort({ month: 1 });
  
  const trend = snapshots.map(s => ({
    month: s.month,
    totalSpend: s.totalSpend
  }));

  res.status(200).json({ trend });
});

export const getWastedSpend = catchAsync(async (req, res, next) => {
  const subscriptions = await Subscription.find({ 
    userId: req.user.id, 
    status: 'active' 
  });
  
  const flaggedSubscriptions = [];
  let potentialMonthlySavings = 0;
  
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
      
      potentialMonthlySavings += monthlyCost;
    }
  }
  
  flaggedSubscriptions.sort((a, b) => b.daysSinceLastUse - a.daysSinceLastUse);
  potentialMonthlySavings = Math.round(potentialMonthlySavings * 100) / 100;
  
  res.status(200).json({
    flaggedSubscriptions,
    potentialMonthlySavings
  });
});


export const getUpcomingPaymentsTimeline = catchAsync(async (req, res, next) => {
  const subscriptions = await Subscription.find({ 
    userId: req.user.id, 
    status: 'active' 
  });

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

  subscriptions.forEach(sub => {
    const relevantDate = sub.isTrial ? sub.trialEndDate : sub.nextRenewalDate;
    if (!relevantDate) return;
    
    const d = new Date(relevantDate);
    d.setHours(0, 0, 0, 0);
    const dateStr = d.toISOString().split('T')[0];
    
    if (daysMap[dateStr]) {
      const cost = sub.cost || 0;
      daysMap[dateStr].subscriptions.push({
        subscriptionId: sub._id,
        name: sub.name,
        cost: cost,
        category: sub.category,
        isTrial: sub.isTrial
      });
      daysMap[dateStr].totalCost += cost;
      totalUpcoming14Days += cost;
    }
  });

  const days = Object.values(daysMap).sort((a, b) => new Date(a.date) - new Date(b.date));

  res.status(200).json({
    days,
    totalUpcoming14Days: Math.round(totalUpcoming14Days * 100) / 100
  });
});

export const getSpendingVelocity = catchAsync(async (req, res, next) => {
  const subscriptions = await Subscription.find({ 
    userId: req.user.id, 
    status: 'active' 
  });

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  const dayOfMonth = today.getDate();
  const daysRemaining = totalDaysInMonth - dayOfMonth;
  
  let monthToDateSpend = 0;
  let projectedMonthEnd = 0;

  const firstDayOfMonth = new Date(year, month, 1);

  subscriptions.forEach(sub => {
    const normalizedMonthly = normalizeToMonthly(sub.cost, sub.billingCycle, sub.billingCycleInterval);
    projectedMonthEnd += normalizedMonthly;

    const createdAt = new Date(sub.createdAt);
    if (createdAt < firstDayOfMonth) {
      monthToDateSpend += normalizedMonthly;
    } else {
      const daysActiveThisMonth = Math.max(1, dayOfMonth - createdAt.getDate() + 1);
      monthToDateSpend += (daysActiveThisMonth / totalDaysInMonth) * normalizedMonthly;
    }
  });

  const prevMonthDate = new Date(year, month - 1, 1);
  // Add 1 to month because month is 0-indexed, and format with leading zero
  const prevMonthStr = prevMonthDate.getFullYear() + '-' + String(prevMonthDate.getMonth() + 1).padStart(2, '0');
  
  const lastSnapshot = await SpendSnapshot.findOne({ userId: req.user.id, month: prevMonthStr });
  
  let percentChangeVsLastMonth = null;
  let trend = 'unknown';
  let lastMonthActual = null;

  if (lastSnapshot) {
    lastMonthActual = lastSnapshot.totalSpend;
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
    lastMonthActual: lastMonthActual ? Math.round(lastMonthActual * 100) / 100 : null,
    percentChangeVsLastMonth,
    trend
  });
});
