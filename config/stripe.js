//Falta manejar errores de Stripe

import Stripe from 'stripe';

// Validar que la clave secreta de Stripe esté configurada
const { STRIPE_SECRET_KEY } = process.env;
if (!STRIPE_SECRET_KEY) {
  const msg = 'Falta STRIPE_SECRET_KEY en las variables de entorno';
  console.error(msg);
  throw new Error(msg);
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15'
});
export default stripe;

