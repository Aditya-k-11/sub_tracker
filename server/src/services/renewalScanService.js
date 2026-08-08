import Subscription from '../models/Subscription.js';
import Notification from '../models/Notification.js';
import { RENEWAL_REMINDER_WINDOW_DAYS, TRIAL_REMINDER_WINDOW_DAYS } from '../config/reminderConfig.js';

export const findUpcomingRenewals = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const renewalWindowEnd = new Date(today);
  renewalWindowEnd.setDate(today.getDate() + RENEWAL_REMINDER_WINDOW_DAYS);
  renewalWindowEnd.setHours(23, 59, 59, 999);
  
  const trialWindowEnd = new Date(today);
  trialWindowEnd.setDate(today.getDate() + TRIAL_REMINDER_WINDOW_DAYS);
  trialWindowEnd.setHours(23, 59, 59, 999);

  const regularRenewals = await Subscription.find({
    status: 'active',
    isTrial: { $ne: true },
    nextRenewalDate: {
      $gte: today,
      $lte: renewalWindowEnd
    }
  }).lean();
  
  const trialRenewals = await Subscription.find({
    status: 'active',
    isTrial: true,
    trialEndDate: {
      $gte: today,
      $lte: trialWindowEnd
    }
  }).lean();

  const processedRegular = regularRenewals.map(sub => ({
    ...sub,
    priority: "normal",
    relevantDate: sub.nextRenewalDate
  }));
  
  const processedTrials = trialRenewals.map(sub => ({
    ...sub,
    priority: "high",
    relevantDate: sub.trialEndDate
  }));
  
  const allUpcoming = [...processedTrials, ...processedRegular];
  
  allUpcoming.sort((a, b) => {
    if (a.priority === 'high' && b.priority === 'normal') return -1;
    if (a.priority === 'normal' && b.priority === 'high') return 1;
    return new Date(a.relevantDate) - new Date(b.relevantDate);
  });

  return allUpcoming;
};

export const findOverdueRenewals = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const overdueRenewals = await Subscription.find({
    status: 'active',
    nextRenewalDate: {
      $lt: today
    }
  });

  return overdueRenewals;
};

export const generateNotifications = async () => {
  const upcomingRenewals = await findUpcomingRenewals();
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  let created = 0;
  let skipped = 0;
  
  const notificationsToInsert = [];

  for (const sub of upcomingRenewals) {
    const type = sub.isTrial ? 'trial_ending' : 'renewal';
    const existing = await Notification.findOne({
      subscriptionId: sub._id,
      type,
      sentAt: {
        $gte: today,
        $lte: endOfDay
      }
    });

    if (existing) {
      skipped++;
      continue;
    }

    const dateOpts = { day: 'numeric', month: 'short', year: 'numeric' };
    const formattedDate = new Date(sub.relevantDate).toLocaleDateString('en-GB', dateOpts);

    const message = sub.isTrial 
      ? `Your free trial for ${sub.name} ends on ${formattedDate}`
      : `${sub.name} renews on ${formattedDate}`;

    notificationsToInsert.push({
      userId: sub.userId,
      subscriptionId: sub._id,
      type,
      priority: sub.priority,
      message,
      sentAt: new Date()
    });
  }

  if (notificationsToInsert.length > 0) {
    await Notification.insertMany(notificationsToInsert);
    created = notificationsToInsert.length;
  }

  return {
    created,
    skipped,
    total: upcomingRenewals.length
  };
};
