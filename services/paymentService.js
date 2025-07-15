import stripe from '../config/stripe.js';

/**
 * Crea una sesión de Stripe Checkout en modo suscripción.
 * @param {{ name:string, lastName:string, email:string, phoneNumber:string, jobTitle:string }} contact
 * @param {'monthly'|'yearly'} plan
 * @returns {Promise<import("stripe").Stripe.Checkout.Session>}
 */
export async function createSubscriptionSession(contact, plan) {
  // Escoge el priceId según el plan
  const priceId = plan === 'yearly'
    ? process.env.PRICE_ID_YEARLY
    : process.env.PRICE_ID_MONTHLY;

  return stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'subscription',
    customer_email: contact.email,
    line_items: [
      { price: priceId, quantity: 1 }
    ],
    metadata: {
      name:        contact.name,
      lastName:    contact.lastName,
      phoneNumber: contact.phoneNumber,
      jobTitle:    contact.jobTitle
    },
    success_url: `${process.env.FRONTEND_URL}/paso3?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:  `${process.env.FRONTEND_URL}/paso1`
  });
}
