import express from 'express';
import { 
  getSuggestedSubscriptions, 
  confirmSuggestion, 
  dismissSuggestion, 
  triggerEmailScan 
} from '../controllers/suggestedSubscriptionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/scan', triggerEmailScan);
router.get('/', getSuggestedSubscriptions);
router.patch('/:id/confirm', confirmSuggestion);
router.patch('/:id/dismiss', dismissSuggestion);

export default router;
