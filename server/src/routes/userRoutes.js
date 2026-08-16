import express from 'express';
import { 
  getCurrentUser, 
  updateProfile, 
  changePassword, 
  updateNotificationPreferences, 
  deleteAccount,
  completeOnboarding,
  updateBudget
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/me', getCurrentUser);
router.patch('/me', updateProfile);
router.post('/me/change-password', changePassword);
router.patch('/me/notification-preferences', updateNotificationPreferences);
router.patch('/me/complete-onboarding', completeOnboarding);
router.patch('/me/budget', updateBudget);
router.delete('/me', deleteAccount);

export default router;
