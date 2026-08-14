import Subscription from '../models/Subscription.js';
import UsageLog from '../models/UsageLog.js';
import Notification from '../models/Notification.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';
import { daysSince } from '../utils/dateHelpers.js';
import { analyzeWastedSpend } from '../services/insightsEngine.js';
import { logActivity } from '../services/activityLogger.js';
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

  logActivity({
    userId: req.user.id,
    action: 'subscription_created',
    subscriptionId: subscription._id,
    subscriptionName: subscription.name,
    metadata: { cost: subscription.cost, category: subscription.category }
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

  // Sorting logic
  let sortParams = { nextRenewalDate: 1 };
  const validSortFields = ['cost', 'nextRenewalDate', 'name', 'createdAt'];
  
  if (req.query.sortBy && validSortFields.includes(req.query.sortBy)) {
    const order = req.query.sortOrder === 'desc' ? -1 : 1;
    sortParams = { [req.query.sortBy]: order };
  }

  const subscriptions = await Subscription.find(query).sort(sortParams);

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

  logActivity({
    userId: req.user.id,
    action: 'subscription_updated',
    subscriptionId: subscription._id,
    subscriptionName: subscription.name,
    metadata: { updatedFields: Object.keys(req.body) }
  });

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

  logActivity({
    userId: req.user.id,
    action: 'subscription_cancelled',
    subscriptionId: subscription._id,
    subscriptionName: subscription.name
  });

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

  logActivity({
    userId: req.user.id,
    action: 'usage_logged',
    subscriptionId: subscription._id,
    subscriptionName: subscription.name,
    metadata: { note: req.body.note || null }
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

  subscription.notes = req.body.notes;
  await subscription.save();

  logActivity({
    userId: req.user.id,
    action: 'notes_updated',
    subscriptionId: subscription._id,
    subscriptionName: subscription.name
  });

  res.status(200).json({ subscription });
});

export const bulkUpdateSubscriptions = catchAsync(async (req, res, next) => {
  const { subscriptionIds, action } = req.body;

  if (!Array.isArray(subscriptionIds) || subscriptionIds.length === 0) {
    throw new AppError("subscriptionIds must be a non-empty array", 400);
  }

  if (!action || !['cancel', 'recategorize'].includes(action.type)) {
    throw new AppError("Invalid action type. Must be 'cancel' or 'recategorize'", 400);
  }

  // Find matching subscriptions that belong to the current user
  // This ensures we only operate on owned subscriptions, silently excluding others
  const filter = {
    _id: { $in: subscriptionIds },
    userId: req.user.id
  };

  const matchingSubscriptions = await Subscription.find(filter).select('_id');
  const matchedCount = matchingSubscriptions.length;
  let modifiedCount = 0;

  if (matchedCount > 0) {
    if (action.type === 'cancel') {
      const result = await Subscription.updateMany(
        { ...filter, status: { $ne: 'cancelled' } },
        { 
          $set: { 
            status: 'cancelled',
            cancelledAt: new Date()
          } 
        }
      );
      modifiedCount = result.modifiedCount;
    } else if (action.type === 'recategorize') {
      const validCategories = ['Entertainment', 'Fitness', 'Productivity', 'Utilities', 'Other'];
      if (!validCategories.includes(action.category)) {
        throw new AppError("Invalid category", 400);
      }
      
      const result = await Subscription.updateMany(
        filter,
        { $set: { category: action.category } }
      );
      modifiedCount = result.modifiedCount;
    }
  }

  res.status(200).json({
    matchedCount,
    modifiedCount,
    requestedCount: subscriptionIds.length
  });
});
