import express from 'express';
import { handleStripeWebhook } from '../controllers/webhookController.js';

const router = express.Router();
router.post(
  '/stripe',
  express.raw({ type: 'application/json' }),
  handleStripeWebhook
);
export default router;
