import stripe from '../../config/stripe.js';

/**
 * Obtiene todos los precios recurrentes (suscripción) activos y sus productos.
 */
export async function getActiveSubscriptionPlans() {
  const prices = await stripe.prices.list({
    active: true,
    type: 'recurring',
    expand: ['data.product'],
    limit: 10
  });

  // Solo devolvemos los datos necesarios para el frontend
  return prices.data.map(price => ({
    id: price.id,
    nickname: price.nickname || price.product.name,
    price: (price.unit_amount / 100).toFixed(2),
    currency: price.currency,
    interval: price.recurring.interval,
    product: price.product.name,
    productId: price.product.id,
    description: price.product.description,
  }));
}
