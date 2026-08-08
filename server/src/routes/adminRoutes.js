import express from 'express';
import { runRenewalScan, runEmailScan } from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/run-renewal-scan', runRenewalScan);

router.post('/run-email-scan', runEmailScan);

export default router;
