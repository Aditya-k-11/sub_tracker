import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import app from './app.js';
import { connectDB } from './config/db.js';
import { startRenewalScanJob } from './jobs/renewalScanJob.js';
import { logger } from './config/logger.js';

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(PORT, '0.0.0.0', () => {
      logger.info(`Server is running in ${NODE_ENV} mode on 0.0.0.0:${PORT}`);
      
      let cronTask = null;
      
      if (process.env.ENABLE_LOCAL_CRON !== 'false') {
        cronTask = startRenewalScanJob();
        logger.info('Local scheduled jobs: ENABLED');
      } else {
        logger.info('Local scheduled jobs: DISABLED');
      }

      const gracefulShutdown = (signal) => {
        logger.info(`Received ${signal}, initiating graceful shutdown...`);

        if (cronTask) {
          cronTask.stop();
          logger.info('Local cron job stopped');
        }

        const forceExitTimer = setTimeout(() => {
          logger.error('Graceful shutdown timed out, forcing exit');
          process.exit(1);
        }, 25000).unref();

        server.close(() => {
          logger.info('All HTTP connections drained');
          mongoose.connection.close(false).then(() => {
            logger.info('MongoDB disconnected cleanly');
            process.exit(0);
          });
        });
      };

      process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
      process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
