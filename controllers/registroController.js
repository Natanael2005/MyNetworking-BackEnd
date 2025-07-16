import { findUserInMongo } from '../services/userService.js';
import { findUserInFirebase } from '../services/authService.js';
import PreUser from '../models/PreUser.js';

export const verificarContacto = async (req, res, next) => {
  const { name, lastName, email, phoneNumber, jobTitle } = req.body;

  // 1) Asegurar que solo vengan estos campos
  const allowedFields = ['name','lastName','email','phoneNumber','jobTitle'];
  const received = Object.keys(req.body);
  const valid = received.length === allowedFields.length
             && received.every(f => allowedFields.includes(f));
  if (!valid) {
    return res.status(400).json({ error: 'Parámetros inválidos' });
  }

  // 2 Llamada a MongoDB
  const { user: mongoUser, error: mongoErr } = await findUserInMongo(email);
  if (mongoErr) {
    console.error('Error Mongo:', mongoErr);
    return res.status(500).json({
      status: 'error',
      message: 'Error al consultar la base de datos',
      details: mongoErr.message
    });
  }

  // 3 Llamada a Firebase Auth
  const { user: firebaseUser, error: authErr } = await findUserInFirebase(email);
  if (authErr) {
    console.error('Error Firebase:', authErr);
    return res.status(500).json({
      status: 'error',
      message: 'Error al consultar el servicio de autenticación',
      details: authErr.message
    });
  }

  // 4 resultados
  if (!mongoUser && !firebaseUser) {
    // Nuevo usuario
    try {
      const preUser = await PreUser.create({
        name,
        lastName,
        email,
        phoneNumber,
        jobTitle
      });
      return res.json({ status: 'new', preUserId: preUser._id });
    } catch (err) {
      console.error('Error guardando PreUser:', err);
      return res.status(500).json({
        status: 'error',
        message: 'Error al guardar pre-registro',
        details: err.message
      });
    }
  }
  if (mongoUser && !firebaseUser) {
    // Existe en Mongo, falta la contraseña
    return res.status(201).json({ status: 'pendingAuth', user: mongoUser });
  }
  if (!mongoUser && firebaseUser) {
    // Caso extraño xd: existe en Auth pero no en Mongo
    return res.status(500).json({
      status: 'internalError',
      message: 'Usuario existe en Auth pero no en MongoDB',
      firebaseUid: firebaseUser.uid
    });
  }
  // Usuario completamente registrado
  return res.json({ status: 'registered', firebaseUid: firebaseUser.uid });
};



import { createSubscriptionSession } from '../services/paymentService.js';

export const iniciarPago = async (req, res) => {
  const { name, lastName, email, phoneNumber, jobTitle, plan } = req.body;
  // Validación de campos
  if (!name || !lastName || !email || !plan || !jobTitle || !['monthly','yearly'].includes(plan)) {
    return res.status(400).json({ error: 'Datos o plan inválido' });
  }

  try {
    const session = await createSubscriptionSession(
      { name, lastName, email, phoneNumber, jobTitle },
      plan
    );
    return res.json({ sessionId: session.id, url: session.url });
  } catch (err) {
    console.error('Error iniciando suscripción:', err);
    return res.status(500).json({ error: 'No se pudo iniciar el pago.' });
  }
};
