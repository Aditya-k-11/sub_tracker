import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  initiateGoogleAuth,
  handleGoogleCallback,
  disconnectGmail,
  getGmailConnectionStatus
} from '../controllers/googleAuthController.js';

const router = express.Router();

router.get('/connect', protect, initiateGoogleAuth);

router.get('/callback', handleGoogleCallback);

router.post('/disconnect', protect, disconnectGmail);

router.get('/status', protect, getGmailConnectionStatus);

export default router;
