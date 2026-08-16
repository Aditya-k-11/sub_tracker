import { body } from 'express-validator';

export const createSubscriptionValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 1 }),
  body('cost').isFloat({ min: 0 }).withMessage('Cost must be a positive number'),
  body('billingCycle').isIn(['weekly', 'monthly', 'yearly']).withMessage('Invalid billing cycle'),
  body('billingCycleInterval').optional().isInt({ min: 1 }).withMessage('Billing cycle interval must be a positive integer'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('nextRenewalDate').isISO8601().withMessage('Must be a valid ISO 8601 date'),
  body('isTrial').optional().isBoolean().withMessage('isTrial must be a boolean'),
  body('trialEndDate').optional({ nullable: true, checkFalsy: true }).isISO8601().withMessage('Must be a valid ISO 8601 date'),
  body('paymentMethod').optional({ nullable: true, checkFalsy: true }).trim(),
  body('sharedWithCount').optional().isInt({ min: 1, max: 20 }).withMessage('sharedWithCount must be between 1 and 20'),
  body('sharedNote').optional({ nullable: true, checkFalsy: true }).trim().isLength({ max: 200 }).withMessage('sharedNote cannot exceed 200 characters')
];

export const updateSubscriptionValidation = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty').isLength({ min: 1 }),
  body('cost').optional().isFloat({ min: 0 }).withMessage('Cost must be a positive number'),
  body('billingCycle').optional().isIn(['weekly', 'monthly', 'yearly']).withMessage('Invalid billing cycle'),
  body('billingCycleInterval').optional().isInt({ min: 1 }).withMessage('Billing cycle interval must be a positive integer'),
  body('category').optional().trim().notEmpty().withMessage('Category cannot be empty'),
  body('nextRenewalDate').optional().isISO8601().withMessage('Must be a valid ISO 8601 date'),
  body('status').optional().isIn(['active', 'paused', 'cancelled']).withMessage('Invalid status'),
  body('isTrial').optional().isBoolean().withMessage('isTrial must be a boolean'),
  body('trialEndDate').optional({ nullable: true, checkFalsy: true }).isISO8601().withMessage('Must be a valid ISO 8601 date'),
  body('paymentMethod').optional({ nullable: true, checkFalsy: true }).trim(),
  body('sharedWithCount').optional().isInt({ min: 1, max: 20 }).withMessage('sharedWithCount must be between 1 and 20'),
  body('sharedNote').optional({ nullable: true, checkFalsy: true }).trim().isLength({ max: 200 }).withMessage('sharedNote cannot exceed 200 characters')
];

export const logUsageValidation = [
  body('note').optional({ nullable: true, checkFalsy: true }).trim()
];
