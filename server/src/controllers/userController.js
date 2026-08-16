import User from '../models/User.js';
import Subscription from '../models/Subscription.js';
import UsageLog from '../models/UsageLog.js';
import Notification from '../models/Notification.js';
import SuggestedSubscription from '../models/SuggestedSubscription.js';
import SpendSnapshot from '../models/SpendSnapshot.js';
import ActivityLog from '../models/ActivityLog.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';
import bcrypt from 'bcryptjs';

export const getCurrentUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.status(200).json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      currency: user.currency,
      createdAt: user.createdAt,
      monthlyBudget: user.monthlyBudget,
      notificationPreferences: user.notificationPreferences,
      hasCompletedOnboarding: user.hasCompletedOnboarding
    }
  });
});

export const updateProfile = catchAsync(async (req, res, next) => {
  const { name, currency } = req.body;
  const user = await User.findById(req.user.id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (name !== undefined) {
    if (name.trim().length === 0) {
      throw new AppError('Name cannot be empty', 400);
    }
    user.name = name;
  }

  if (currency !== undefined) {
    if (!/^[A-Z]{3}$/.test(currency)) {
      throw new AppError('Currency must be a valid 3-letter code', 400);
    }
    user.currency = currency;
  }

  // Note: Email change is intentionally omitted. Changing a login email is a 
  // sensitive operation typically requiring re-verification.

  await user.save();

  res.status(200).json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      currency: user.currency,
      createdAt: user.createdAt,
      notificationPreferences: user.notificationPreferences,
      hasCompletedOnboarding: user.hasCompletedOnboarding
    }
  });
});

export const changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isMatch) {
    throw new AppError('Current password is incorrect', 401);
  }

  if (!newPassword || newPassword.length < 6) {
    throw new AppError('New password must be at least 6 characters long', 400);
  }

  const salt = await bcrypt.genSalt(10);
  user.passwordHash = await bcrypt.hash(newPassword, salt);
  await user.save();

  // Note: In a complete implementation, this would also invalidate all OTHER existing JWTs for this user 
  // (forcing re-login everywhere except the current session). Since this project's JWTs are stateless 
  // with no server-side revocation list, that's not implemented here.
  res.status(200).json({ message: 'Password updated successfully' });
});

export const updateNotificationPreferences = catchAsync(async (req, res, next) => {
  const { notificationPreferences } = req.body;
  const user = await User.findById(req.user.id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (notificationPreferences) {
    user.notificationPreferences = {
      ...user.notificationPreferences,
      ...notificationPreferences
    };
    await user.save();
  }

  res.status(200).json({ notificationPreferences: user.notificationPreferences });
});

export const completeOnboarding = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  user.hasCompletedOnboarding = true;
  await user.save();

  res.status(200).json({ message: 'Onboarding completed' });
});

export const deleteAccount = catchAsync(async (req, res, next) => {
  const { password } = req.body;
  const user = await User.findById(req.user.id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new AppError('Password is incorrect', 401);
  }

  const userId = user._id;

  // Find all subscription IDs for this user to delete associated UsageLogs
  const subscriptions = await Subscription.find({ userId });
  const subscriptionIds = subscriptions.map(sub => sub._id);

  // Perform a genuine hard-delete of all associated data.
  // This is distinct from the soft-delete/cancel pattern used for subscriptions elsewhere.
  await UsageLog.deleteMany({ subscriptionId: { $in: subscriptionIds } });
  await Subscription.deleteMany({ userId });
  await Notification.deleteMany({ userId });
  await SuggestedSubscription.deleteMany({ userId });
  await SpendSnapshot.deleteMany({ userId });
  await ActivityLog.deleteMany({ userId });
  await User.deleteOne({ _id: userId });

  res.status(200).json({ message: 'Account and all associated data deleted successfully' });
});

export const updateBudget = catchAsync(async (req, res, next) => {
  const { monthlyBudget } = req.body;
  const user = await User.findById(req.user.id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (monthlyBudget !== null && (typeof monthlyBudget !== 'number' || monthlyBudget < 0)) {
    throw new AppError('monthlyBudget must be null or a positive number', 400);
  }

  user.monthlyBudget = monthlyBudget;
  await user.save();

  await ActivityLog.create({
    userId: user._id,
    action: 'budget_set',
    metadata: { monthlyBudget }
  });

  res.status(200).json({ monthlyBudget: user.monthlyBudget });
});
