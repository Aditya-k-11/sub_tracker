import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
  createSubscriptionValidation,
  updateSubscriptionValidation,
  logUsageValidation
} from '../middleware/validators/subscriptionValidators.js';
import {
  createSubscription,
  getSubscriptions,
  getSubscriptionById,
  updateSubscription,
  deleteSubscription,
  logUsage,
  getUsageLogs,
  deleteUsageLog,
  getUsageSummary
} from '../controllers/subscriptionController.js';

const router = express.Router();

router.use(protect);

router.post('/', createSubscriptionValidation, validateRequest, createSubscription);
router.get('/', getSubscriptions);
router.get('/:id', getSubscriptionById);
router.patch('/:id', updateSubscriptionValidation, validateRequest, updateSubscription);
router.delete('/:id', deleteSubscription);
router.post('/:id/usage', logUsageValidation, validateRequest, logUsage);
router.get('/:id/usage/summary', getUsageSummary);
router.get('/:id/usage', getUsageLogs);
router.delete('/:id/usage/:usageId', deleteUsageLog);

export default router;
