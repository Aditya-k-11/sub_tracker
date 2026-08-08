import catchAsync from '../utils/catchAsync.js';
import { findUpcomingRenewals, findOverdueRenewals, generateNotifications } from '../services/renewalScanService.js';
import { searchSubscriptionEmails } from '../services/gmailService.js';
import { parseAllCandidates, saveSuggestedSubscriptions } from '../services/emailParsingService.js';

export const runRenewalScan = catchAsync(async (req, res, next) => {
  const upcomingRenewals = await findUpcomingRenewals();
  const overdueRenewals = await findOverdueRenewals();
  const notificationResult = await generateNotifications();

  const highPriorityCount = upcomingRenewals.filter(s => s.priority === 'high').length;

  res.status(200).json({
    upcomingRenewals,
    overdueRenewals,
    highPriorityCount,
    notificationResult,
    scannedAt: new Date().toISOString()
  });
});

export const runEmailScan = catchAsync(async (req, res, next) => {
  const rawCandidates = await searchSubscriptionEmails(req.user.id);
  const parsedCandidates = await parseAllCandidates(req.user.id, rawCandidates);
  const saveResult = await saveSuggestedSubscriptions(req.user.id, parsedCandidates);

  res.status(200).json({
    parsedCandidates,
    rawCandidateCount: rawCandidates.length,
    saveResult
  });
});
