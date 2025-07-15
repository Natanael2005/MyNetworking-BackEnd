import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Solo inicializar una vez
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(process.env.GOOGLE_APPLICATION_CREDENTIALS),
  });
  console.log('✅ Firebase Admin inicializado correctamente');
}

export default admin;
