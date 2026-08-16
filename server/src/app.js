import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes.js';
import googleAuthRoutes from './routes/googleAuthRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import suggestedSubscriptionRoutes from './routes/suggestedSubscriptionRoutes.js';
import activityRoutes from './routes/activityRoutes.js';
import userRoutes from './routes/userRoutes.js';
import errorHandler from './middleware/errorHandler.js';
import metricsMiddleware from './middleware/metricsMiddleware.js';
import { register } from './config/metrics.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use(metricsMiddleware);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use('/api/auth', authRoutes);
app.use('/api/auth/google', googleAuthRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/suggestions', suggestedSubscriptionRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/users', userRoutes);

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.send(await register.metrics());
});

app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    db: dbState
  });
});

app.get('/api/health/live', (req, res) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/api/health/slow', (req, res) => {
  setTimeout(() => {
    res.status(200).json({ status: 'ok', delayed: true });
  }, 1000);
});

app.get('/api/health/ready', (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  const status = isConnected ? 200 : 503;

  res.status(status).json({
    status: isConnected ? 'ready' : 'not ready',
    timestamp: new Date().toISOString(),
    db: isConnected ? 'connected' : 'disconnected'
  });
});

app.use((req, res, next) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use(errorHandler);

export default app;
