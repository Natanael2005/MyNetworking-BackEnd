import admin from '../config/firebase.js';

/**
 * Busca un usuario por email en Firebase Auth.
 * @param {string} email
 * @returns {Promise<{user: import('firebase-admin').auth.UserRecord|null, error: Error|null}>}
 */
export async function findUserInFirebase(email) {
  try {
    const user = await admin.auth().getUserByEmail(email);
    return { user, error: null };
  } catch (err) {
    if (err.code === 'auth/user-not-found') {
      return { user: null, error: null };
    }
    return { user: null, error: err };
  }
}
