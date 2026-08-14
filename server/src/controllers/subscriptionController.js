import Subscription from '../models/Subscription.js';
import UsageLog from '../models/UsageLog.js';
import Notification from '../models/Notification.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';
import { daysSince } from '../utils/dateHelpers.js';
import { analyzeWastedSpend } from '../services/insightsEngine.js';

export const createSubscription = catchAsync(async (req, res, next) => {
  const { name, cost, billingCycle, billingCycleInterval, category, nextRenewalDate, isTrial, trialEndDate, paymentMethod } = req.body;

  const subscription = await Subscription.create({
    userId: req.user.id,
    name,
    cost,
    billingCycle,
    billingCycleInterval,
    category,
    nextRenewalDate,
    isTrial,
    trialEndDate,
    paymentMethod
  });

  res.status(201).json({ subscription });
});

export const getSubscriptions = catchAsync(async (req, res, next) => {
  const query = { userId: req.user.id };

  if (req.query.category) {
    query.category = req.query.category;
  }
  if (req.query.status) {
    query.status = req.query.status;
  }

  const subscriptions = await Subscription.find(query).sort({ nextRenewalDate: 1 });

  res.status(200).json({
    count: subscriptions.length,
    subscriptions
  });
});

export const getSubscriptionById = catchAsync(async (req, res, next) => {
  const subscription = await Subscription.findById(req.params.id);

  if (!subscription) {
    throw new AppError("Subscription not found", 404);
  }

  if (subscription.userId.toString() !== req.user.id) {
    throw new AppError("Not authorized to access this subscription", 403);
  }

  res.status(200).json({ subscription });
});

export const updateSubscription = catchAsync(async (req, res, next) => {
  const subscription = await Subscription.findById(req.params.id);

  if (!subscription) {
    throw new AppError("Subscription not found", 404);
  }

  if (subscription.userId.toString() !== req.user.id) {
    throw new AppError("Not authorized to access this subscription", 403);
  }

  const allowedUpdates = ['name', 'cost', 'billingCycle', 'billingCycleInterval', 'category', 'nextRenewalDate', 'status', 'isTrial', 'trialEndDate', 'paymentMethod'];
  
  let willBeCancelled = false;
  if (req.body.status === 'cancelled' && subscription.status !== 'cancelled') {
    willBeCancelled = true;
  }

  allowedUpdates.forEach(field => {
    if (req.body[field] !== undefined) {
      subscription[field] = req.body[field];
    }
  });

  if (willBeCancelled) {
    subscription.cancelledAt = new Date();
  }

  await subscription.save();

  res.status(200).json({ subscription });
});

export const deleteSubscription = catchAsync(async (req, res, next) => {
  const subscription = await Subscription.findById(req.params.id);

  if (!subscription) {
    throw new AppError("Subscription not found", 404);
  }

  if (subscription.userId.toString() !== req.user.id) {
    throw new AppError("Not authorized to access this subscription", 403);
  }

  subscription.status = 'cancelled';
  subscription.cancelledAt = new Date();
  
  await subscription.save();

  res.status(200).json({
    message: "Subscription cancelled (soft-deleted)",
    subscription
  });
});

export const logUsage = catchAsync(async (req, res, next) => {
  const subscription = await Subscription.findById(req.params.id);

  if (!subscription) {
    throw new AppError("Subscription not found", 404);
  }

  if (subscription.userId.toString() !== req.user.id) {
    throw new AppError("Not authorized to access this subscription", 403);
  }

  const usageLog = await UsageLog.create({
    subscriptionId: subscription._id,
    usedAt: new Date(),
    note: req.body.note || null
  });

  res.status(201).json({ usageLog });
});

export const getUsageLogs = catchAsync(async (req, res, next) => {
  const subscription = await Subscription.findById(req.params.id);

  if (!subscription) {
    throw new AppError("Subscription not found", 404);
  }

  if (subscription.userId.toString() !== req.user.id) {
    throw new AppError("Not authorized to access this subscription", 403);
  }

  const usageLogs = await UsageLog.find({ subscriptionId: subscription._id }).sort({ usedAt: -1 });

  res.status(200).json({
    count: usageLogs.length,
    usageLogs
  });
});

export const deleteUsageLog = catchAsync(async (req, res, next) => {
  const subscription = await Subscription.findById(req.params.id);

  if (!subscription) {
    throw new AppError("Subscription not found", 404);
  }

  if (subscription.userId.toString() !== req.user.id) {
    throw new AppError("Not authorized to access this subscription", 403);
  }

  const usageLog = await UsageLog.findById(req.params.usageId);
  if (!usageLog || usageLog.subscriptionId.toString() !== req.params.id) {
    throw new AppError("Usage log not found for this subscription", 404);
  }

  await UsageLog.findByIdAndDelete(req.params.usageId);

  res.status(200).json({ message: "Usage log deleted" });
});

export const getUsageSummary = catchAsync(async (req, res, next) => {
  const subscription = await Subscription.findById(req.params.id);

  if (!subscription) {
    throw new AppError("Subscription not found", 404);
  }

  if (subscription.userId.toString() !== req.user.id) {
    throw new AppError("Not authorized to access this subscription", 403);
  }

  const usageLogs = await UsageLog.find({ subscriptionId: subscription._id }).sort({ usedAt: -1 });

  const totalUsageCount = usageLogs.length;
  const lastUsedAt = totalUsageCount > 0 ? usageLogs[0].usedAt : null;
  const daysSinceLastUse = lastUsedAt ? daysSince(lastUsedAt) : null;

  res.status(200).json({
    subscriptionId: subscription._id,
    totalUsageCount,
    lastUsedAt,
    daysSinceLastUse
  });
});

export const getSubscriptionDetail = catchAsync(async (req, res, next) => {
  const subscription = await Subscription.findById(req.params.id);

  if (!subscription) {
    throw new AppError("Subscription not found", 404);
  }

  if (subscription.userId.toString() !== req.user.id) {
    throw new AppError("Not authorized to access this subscription", 403);
  }

  const [usageLogs, notifications, wastedSpendInsights] = await Promise.all([
    UsageLog.find({ subscriptionId: subscription._id }).sort({ usedAt: -1 }).lean(),
    Notification.find({ subscriptionId: subscription._id }).sort({ sentAt: -1 }).lean(),
    analyzeWastedSpend(req.user.id)
  ]);

  const totalUsageCount = usageLogs.length;
  let daysSinceLastUse = null;
  
  if (totalUsageCount > 0) {
    daysSinceLastUse = daysSince(usageLogs[0].usedAt);
  } else {
    daysSinceLastUse = daysSince(subscription.createdAt);
  }

  const isCurrentlyFlaggedWasted = wastedSpendInsights.some(
    insight => insight.subscriptionId.toString() === subscription._id.toString()
  );

  res.status(200).json({
    subscription,
    usageLogs,
    notifications,
    costHistory: subscription.costHistory || [],
    summary: {
      daysSinceLastUse,
      totalUsageCount,
      isCurrentlyFlaggedWasted
    }
  });
});

export const updateSubscriptionNotes = catchAsync(async (req, res, next) => {
  const subscription = await Subscription.findById(req.params.id);

  if (!subscription) {
    throw new AppError("Subscription not found", 404);
  }

  if (subscription.userId.toString() !== req.user.id) {
    throw new AppError("Not authorized to access this subscription", 403);
  }

  subscription.notes = req.body.notes !== undefined ? req.body.notes : subscription.notes;
  await subscription.save();

  res.status(200).json({ subscription });
});

