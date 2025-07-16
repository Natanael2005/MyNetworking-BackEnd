import stripe from '../config/stripe.js';

/**
 * Crea un intent de suscripción gestionando el cliente de Stripe.
 * @param {{ name:string, lastName:string, email:string, phoneNumber?:string, jobTitle?:string }} contact
 * @param {'monthly'|'yearly'} plan
 * @param {string} preUserId
 * @returns {Promise<{client_secret:string, customerId:string, subscriptionId:string}>}
 */
export async function createSubscriptionIntent(contact, plan, preUserId) {
  const priceId = plan === 'yearly'
    ? process.env.PRICE_ID_YEARLY
    : process.env.PRICE_ID_MONTHLY;

  // Buscar cliente existente por email
  const existing = await stripe.customers.list({ email: contact.email, limit: 1 });
  let customer = existing.data[0];
  if (!customer) {
    customer = await stripe.customers.create({
      email: contact.email,
      name: `${contact.name} ${contact.lastName}`.trim(),
      phone: contact.phoneNumber
    });
  }

  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ price: priceId }],
    payment_behavior: 'default_incomplete',
    expand: ['latest_invoice.payment_intent'],
    metadata: { preUserId }
  });

  const clientSecret = subscription.latest_invoice.payment_intent.client_secret;

  return {
    client_secret: clientSecret,
    customerId: customer.id,
    subscriptionId: subscription.id
  };
}
