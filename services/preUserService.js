import PreUser from '../models/PreUser.js';

/**
 * Busca un PreUser por email.
 * @param {string} email
 * @returns {Promise<{ preUser: object|null, error: Error|null }>}
 */
export async function findPreUserByEmail(email) {
  try {
    const preUser = await PreUser.findOne({ email }).exec();
    return { preUser, error: null };
  } catch (error) {
    return { preUser: null, error };
  }
}

/**
 * Crea un nuevo PreUser.
 * @param {{ name:string, lastName:string, email:string, phoneNumber?:string, jobTitle?:string }} data
 * @returns {Promise<{ preUser: object|null, error: Error|null }>}
 */
export async function createPreUser(data) {
  try {
    const preUser = await PreUser.create(data);
    return { preUser, error: null };
  } catch (error) {
    return { preUser: null, error };
  }
}
