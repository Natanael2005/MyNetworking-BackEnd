import PreUser from '../../models/PreUser.js';

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



/**
 * Busca un PreUser por su ID.
 * @param {string} preUserId
 * @returns {Promise<{ preUser: object|null, error: Error|null }>}
 */
export async function findPreUserById(preUserId) {
  try {
    const preUser = await PreUser.findById(preUserId).lean();
    return { preUser, error: null };
  } catch (error) {
    console.error(`❌ Error buscando PreUser con ID ${preUserId}:`, error);
    return { preUser: null, error };
  }
}

/**
 * Elimina un PreUser por su ID.
 * @param {string} preUserId
 * @returns {Promise<{ deleted: boolean, error: Error|null }>}
 */
export async function deletePreUserById(preUserId) {
  try {
    const result = await PreUser.findByIdAndDelete(preUserId).exec();
    return { deleted: !!result, error: null };
  } catch (error) {
    console.error(`❌ Error eliminando PreUser con ID ${preUserId}:`, error);
    return { deleted: false, error };
  }
}

