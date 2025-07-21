import stripe from '../../config/stripe.js';

/**
 * Crea una suscripción para un cliente en Stripe.
 * @param {string} customerId
 * @param {string} priceId
 * @param {string} preUserId
 * @returns {Promise<Object>} Suscripción creada.
 */
export async function createStripeSubscription(customerId, priceId, preUserId) {
  try {
    return await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
      metadata: { preUserId }
    });
  } catch (error) {
    console.error('❌ Error creando la suscripción en Stripe:', error);
    throw new Error('No se pudo crear la suscripción en Stripe.');
  }
}
