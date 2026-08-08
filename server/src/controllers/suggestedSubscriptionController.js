import SuggestedSubscription from '../models/SuggestedSubscription.js';
import Subscription from '../models/Subscription.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';
import { searchSubscriptionEmails } from '../services/gmailService.js';
import { parseAllCandidates, saveSuggestedSubscriptions } from '../services/emailParsingService.js';

export const getSuggestedSubscriptions = catchAsync(async (req, res, next) => {
  const suggestions = await SuggestedSubscription.find({
    userId: req.user.id,
    status: 'pending'
  }).sort({ sourceDate: -1 });

  const confidenceValues = { 'high': 3, 'medium': 2, 'low': 1 };
  suggestions.sort((a, b) => confidenceValues[b.confidence] - confidenceValues[a.confidence]);

  res.status(200).json({
    suggestions,
    count: suggestions.length
  });
});

export const confirmSuggestion = catchAsync(async (req, res, next) => {
  const suggestion = await SuggestedSubscription.findById(req.params.id);

  if (!suggestion) {
    throw new AppError("Suggestion not found", 404);
  }

  if (suggestion.userId.toString() !== req.user.id) {
    throw new AppError("Not authorized to access this suggestion", 403);
  }

  if (suggestion.status !== 'pending') {
    throw new AppError(`Suggestion is already ${suggestion.status}`, 400);
  }

  const name = req.body.name || suggestion.suggestedName;
  const cost = req.body.cost !== undefined ? req.body.cost : suggestion.suggestedCost;
  const billingCycle = req.body.billingCycle || suggestion.suggestedBillingCycle;
  const category = req.body.category || suggestion.suggestedCategory;
  const nextRenewalDate = req.body.nextRenewalDate;

  const billingCycleInterval = req.body.billingCycleInterval || 1;
  const isTrial = req.body.isTrial || false;
  const trialEndDate = req.body.trialEndDate || null;
  const paymentMethod = req.body.paymentMethod || null;

  if (!name || cost === null || cost === undefined || !billingCycle || !category || !nextRenewalDate) {
    throw new AppError("Missing required fields to confirm this subscription — please provide cost, billing cycle, and next renewal date", 400);
  }

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

  suggestion.status = 'confirmed';
  suggestion.confirmedSubscriptionId = subscription._id;
  await suggestion.save();

  res.status(201).json({ subscription, suggestion });
});

export const dismissSuggestion = catchAsync(async (req, res, next) => {
  const suggestion = await SuggestedSubscription.findById(req.params.id);

  if (!suggestion) {
    throw new AppError("Suggestion not found", 404);
  }

  if (suggestion.userId.toString() !== req.user.id) {
    throw new AppError("Not authorized to access this suggestion", 403);
  }

  if (suggestion.status !== 'pending') {
    throw new AppError(`Suggestion is already ${suggestion.status}`, 400);
  }

  suggestion.status = 'dismissed';
  await suggestion.save();

  res.status(200).json({ message: "Suggestion dismissed" });
});

export const triggerEmailScan = catchAsync(async (req, res, next) => {
  const rawCandidates = await searchSubscriptionEmails(req.user.id);
  const parsedCandidates = await parseAllCandidates(req.user.id, rawCandidates);
  const result = await saveSuggestedSubscriptions(req.user.id, parsedCandidates);

  res.status(200).json({
    newSuggestions: result.newSuggestions,
    alreadyReviewed: result.alreadyReviewed,
    total: result.total,
    scannedAt: new Date().toISOString()
  });
});
