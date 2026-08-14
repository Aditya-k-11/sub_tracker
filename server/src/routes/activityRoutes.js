import express from 'express';
import { getRecentActivity, getActivityHistory } from '../controllers/activityController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/recent', getRecentActivity);
router.get('/history', getActivityHistory);

export default router;
