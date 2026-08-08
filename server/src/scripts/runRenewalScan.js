import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from '../config/db.js';
import { generateNotifications } from '../services/renewalScanService.js';
import { logger } from '../config/logger.js';
import mongoose from 'mongoose';

const main = async () => {
  try {
    await connectDB();
    const result = await generateNotifications();
    logger.info(`Renewal Scan Completed: Created ${result.created}, Skipped ${result.skipped}, Total ${result.total}`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    logger.error(`Renewal Scan Failed: ${error.message}`);
    process.exit(1);
  }
};

main();
