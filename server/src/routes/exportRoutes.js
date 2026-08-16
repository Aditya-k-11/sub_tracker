import express from 'express';
import { exportSubscriptions } from '../controllers/exportController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/subscriptions', exportSubscriptions);

export default router;
