import User from '../../models/User.js';

/**
 * Busca un usuario por email en MongoDB.
 * @param {string} email
 * @returns {Promise<{ user: object|null, error: Error|null }>}
 */
export async function findUserInMongo(email) {
  try {
    const user = await User.findOne({ email }).exec();
    return { user, error: null };
  } catch (error) {
    console.error(`Error buscando User con email ${email}:`, error);
    return { user: null, error };
  }
}

/**
 * Crea o actualiza un usuario a partir de los datos de un PreUser.
 * @param {Object} preUser - Documento del PreUser.
 * @param {string} customerId - ID de cliente en Stripe.
 * @param {string} subscriptionId - ID de suscripción en Stripe.
 * @returns {Promise<{ user: object|null, error: Error|null }>}
 */
export async function upsertUserFromPreUser(preUser, customerId, subscriptionId) {
  try {
    const user = await User.findOneAndUpdate(
      { email: preUser.email },
      {
        $set: {
          name: preUser.name,
          lastName: preUser.lastName,
          phoneNumber: preUser.phoneNumber,
          jobTitle: preUser.jobTitle,
          stripe_id: customerId,
          stripeSubscriptionId: subscriptionId,
          estado: 'pago_realizado'
        }
      },
      { upsert: true, new: true }
    ).exec();
    return { user, error: null };
  } catch (error) {
    console.error(`Error creando/actualizando User con email ${preUser.email}:`, error);
    return { user: null, error };
  }
}
