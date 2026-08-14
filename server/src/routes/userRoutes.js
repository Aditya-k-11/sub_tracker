import express from 'express';
import { 
  getCurrentUser, 
  updateProfile, 
  changePassword, 
  updateNotificationPreferences, 
  deleteAccount 
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/me', getCurrentUser);
router.patch('/me', updateProfile);
router.post('/me/change-password', changePassword);
router.patch('/me/notification-preferences', updateNotificationPreferences);
router.delete('/me', deleteAccount);

export default router;
