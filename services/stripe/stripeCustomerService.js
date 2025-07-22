import stripe from '../../config/stripe.js';

/**
 * Busca un cliente existente en Stripe por correo.
 * @param {string} email
 * @returns {Promise<Object|null>} Cliente encontrado o null.
 */
export async function findStripeCustomerByEmail(email) {
  try {
    const existing = await stripe.customers.list({ email, limit: 1 });
    return existing.data[0] || null;
  } catch (error) {
    console.error('Error buscando cliente por email en Stripe:', error);
    throw new Error('No se pudo buscar el cliente en Stripe.');
  }
}

/**
 * Crea un nuevo cliente en Stripe.
 * @param {{ name:string, lastName:string, email:string, phoneNumber?:string }} contact
 * @returns {Promise<Object>} Cliente creado.
 */
export async function createStripeCustomer(contact) {
  try {
    return await stripe.customers.create({
      email: contact.email,
      name: `${contact.name} ${contact.lastName}`.trim(),
      phone: contact.phoneNumber
    });
  } catch (error) {
    console.error('Error creando cliente en Stripe:', error);
    throw new Error('No se pudo crear el cliente en Stripe.');
  }
}

/**
 * Busca un cliente por email y lo crea si no existe.
 * @param {{ name:string, lastName:string, email:string, phoneNumber?:string }} contact
 * @returns {Promise<Object>} Cliente de Stripe.
 */
export async function findOrCreateStripeCustomer(contact) {
  const customer = await findStripeCustomerByEmail(contact.email);
  return customer || await createStripeCustomer(contact);
}
