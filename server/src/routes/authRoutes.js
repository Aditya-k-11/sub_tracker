import express from 'express';
import { registerUser, loginUser } from '../controllers/authController.js';
import { registerValidation, loginValidation } from '../middleware/validators/authValidators.js';
import { validateRequest } from '../middleware/validateRequest.js';

const router = express.Router();

router.post('/register', registerValidation, validateRequest, registerUser);
router.post('/login', loginValidation, validateRequest, loginUser);

export default router;
