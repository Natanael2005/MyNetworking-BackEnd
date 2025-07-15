import User from '../models/User.js';

/**
 * Busca un usuario por email en MongoDB.
 * @param {string} email
 * @returns {Promise<{user: object|null, error: Error|null}>}
 */
export async function findUserInMongo(email) {
  try {
    const user = await User.findOne({ email }).exec();
    return { user, error: null };
  } catch (error) {
    return { user: null, error };
  }
}
