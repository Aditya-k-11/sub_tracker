import ActivityLog from '../models/ActivityLog.js';
import { logger } from '../config/logger.js';

/**
 * Logs an activity entry asynchronously.
 * Deliberate fire-and-forget design: activity logging is a secondary concern.
 * A failure to write a log entry should NEVER cause the underlying core action to fail or roll back.
 * Any errors are caught and logged via Winston but not propagated.
 */
export const logActivity = async ({ userId, action, subscriptionId = null, subscriptionName = null, metadata = {} }) => {
  try {
    const logEntry = new ActivityLog({
      userId,
      action,
      subscriptionId,
      subscriptionName,
      metadata
    });
    
    await logEntry.save();
  } catch (error) {
    logger.error('Failed to save activity log entry', {
      error: error.message,
      context: { userId, action, subscriptionId }
    });
  }
};
