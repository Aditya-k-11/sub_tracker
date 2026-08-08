
import cron from 'node-cron';
import { generateNotifications } from '../services/renewalScanService.js';
import { logger } from '../config/logger.js';

export const startRenewalScanJob = () => {

  const cronExpression = '* * * * *'; 

  const task = cron.schedule(cronExpression, async () => {
    try {
      const result = await generateNotifications();
      logger.info(`Scheduled Renewal Scan Complete: Created ${result.created}, Skipped ${result.skipped}, Total ${result.total}`);
    } catch (error) {
      logger.error(`Scheduled Renewal Scan FAILED: ${error.message}`);
      
    }
  });

  return task;
};

export const runScanNow = async () => {
  try {
    const result = await generateNotifications();
    logger.info(`Manual Renewal Scan Complete: Created ${result.created}, Skipped ${result.skipped}, Total ${result.total}`);
  } catch (error) {
    logger.error(`Manual Renewal Scan FAILED: ${error.message}`);
  }
};
