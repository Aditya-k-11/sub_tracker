const fs = require('fs');
const path = require('path');

const controllerPath = path.join(process.cwd(), 'server', 'src', 'controllers', 'analyticsController.js');
let controllerContent = fs.readFileSync(controllerPath, 'utf8');

const getUpcomingPaymentsTimelineStr = `
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
    const { getDayLabel } = require('../utils/dateHelpers.js'); 
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
`;

if (!controllerContent.includes('getUpcomingPaymentsTimeline')) {
  controllerContent = controllerContent.trim() + '\n\n' + getUpcomingPaymentsTimelineStr;
  fs.writeFileSync(controllerPath, controllerContent);
}

const routesPath = path.join(process.cwd(), 'server', 'src', 'routes', 'analyticsRoutes.js');
let routesContent = fs.readFileSync(routesPath, 'utf8');

if (!routesContent.includes('getUpcomingPaymentsTimeline')) {
  routesContent = routesContent.replace(
    /import { (.*) } from '\.\.\/controllers\/analyticsController\.js';/,
    "import { $1, getUpcomingPaymentsTimeline, getSpendingVelocity } from '../controllers/analyticsController.js';"
  );
  routesContent = routesContent.replace(
    /export default router;/,
    "router.get('/upcoming-timeline', getUpcomingPaymentsTimeline);\nrouter.get('/velocity', getSpendingVelocity);\n\nexport default router;"
  );
  fs.writeFileSync(routesPath, routesContent);
}
