import { findOrCreateStripeCustomer } from './stripeCustomerService.js';
import { createStripeSubscription } from './stripeSubscriptionService.js';
import stripe from '../../config/stripe.js'; // Asegúrate de importar stripe

// Validar que los IDs de precios estén configurados
const { PRICE_ID_MONTHLY, PRICE_ID_YEARLY } = process.env;
if (!PRICE_ID_MONTHLY || !PRICE_ID_YEARLY) {
  const msg = 'Faltan PRICE_ID_MONTHLY o PRICE_ID_YEARLY en las variables de entorno';
  console.error(msg);
  throw new Error(msg);
}

/**
 * Crea un intent de suscripción gestionando el cliente de Stripe.
 * @param {{ name:string, lastName:string, email:string, phoneNumber?:string, jobTitle?:string }} contact
 * @param {'monthly'|'yearly'} plan
 * @param {string} preUserId
 * @returns {Promise<{client_secret:string, customerId:string, subscriptionId:string}>}
 */
export async function createSubscriptionIntent(contact, plan, preUserId) {
  try {
    const priceId = plan === 'yearly'
      ? PRICE_ID_YEARLY
      : PRICE_ID_MONTHLY;

    // 1. Buscar o crear cliente
    const customer = await findOrCreateStripeCustomer(contact);

    // 2. Crear la suscripción
    const subscription = await createStripeSubscription(customer.id, priceId, preUserId);

    // 3. Actualizar PaymentIntent con metadata extra
    const paymentIntentId = subscription.latest_invoice.payment_intent.id;
    await stripe.paymentIntents.update(paymentIntentId, {
      metadata: {
        preUserId,
        subscriptionId: subscription.id
      }
    });

    // 4. Devolver datos relevantes
    return {
      client_secret: subscription.latest_invoice.payment_intent.client_secret,
      customerId: customer.id,
      subscriptionId: subscription.id
    };
  } catch (error) {
    console.error('❌ Error en createSubscriptionIntent:', error);
    throw new Error('No se pudo iniciar el proceso de suscripción.');
  }
}
