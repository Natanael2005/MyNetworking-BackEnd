import { findUserInMongo } from '../services/userService.js';
import { findUserInFirebase } from '../services/authService.js';
import { findPreUserByEmail, createPreUser } from '../services/preUserService.js';
import PreUser from '../models/PreUser.js';

export const verificarContacto = async (req, res) => {
  const { name, lastName, email, phoneNumber, jobTitle } = req.body;

  const handleError = (message, err) => {
    console.error(message, err);
    return res.status(500).json({
      status: 'error',
      message,
      details: err.message
    });
  };

  const { preUser, error: preErr } = await findPreUserByEmail(email);
  if (preErr) {
    return handleError('Error al consultar pre-registro', preErr);
  }

  if (preUser) {
    return res.json({ status: 'new', preUserId: preUser._id });
  }

  const { user: mongoUser, error: mongoErr } = await findUserInMongo(email);
  if (mongoErr) {
    return handleError('Error al consultar la base de datos', mongoErr);
  }

  const { user: firebaseUser, error: authErr } = await findUserInFirebase(email);
  if (authErr) {
    return handleError('Error al consultar el servicio de autenticación', authErr);
  }

  // 4 resultados
  if (!mongoUser && !firebaseUser) {
    const { preUser: newPreUser, error: createErr } = await createPreUser({
      name,
      lastName,
      email,
      phoneNumber,
      jobTitle
    });
    if (createErr) {
      return handleError('Error al guardar pre-registro', createErr);
    }
    return res.json({ status: 'new', preUserId: newPreUser._id });
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



import { createSubscriptionIntent } from '../services/paymentService.js';

export const iniciarPago = async (req, res) => {
  const { preUserId, plan } = req.body;

  const planValido = ['monthly', 'yearly'].includes(plan);
  if (!preUserId || !planValido) {
    return res.status(400).json({ error: 'Datos o plan inválido' });
  }

  try {
    const preUser = await PreUser.findById(preUserId).lean();
    if (!preUser) {
      return res.status(404).json({ error: 'Pre-usuario no encontrado' });
    }

    const contact = {
      name: preUser.name,
      lastName: preUser.lastName,
      email: preUser.email,
      phoneNumber: preUser.phoneNumber,
      jobTitle: preUser.jobTitle
    };

    const intent = await createSubscriptionIntent(contact, plan, preUserId);
    return res.json({ client_secret: intent.client_secret });
  } catch (err) {
    console.error('Error iniciando suscripción:', err);
    return res.status(500).json({ error: 'No se pudo iniciar el pago.' });
  }
};
