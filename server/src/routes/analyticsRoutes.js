import express from 'express';
import { getSpendSummary, getCategoryBreakdown, getSpendTrend, getWastedSpend, getUpcomingPaymentsTimeline, getSpendingVelocity } from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/summary', getSpendSummary);
router.get('/categories', getCategoryBreakdown);
router.get('/trend', getSpendTrend);
router.get('/wasted', getWastedSpend);

router.get('/upcoming-timeline', getUpcomingPaymentsTimeline);
router.get('/velocity', getSpendingVelocity);

export default router;
