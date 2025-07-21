import stripe from '../config/stripe.js';
import { processStripeEvent } from '../services/stripe/stripeWebhookService.js';

/**
 * Controlador principal para manejar los webhooks de Stripe.
 */
export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  await processStripeEvent(event);
  res.json({ received: true });
};
