import request from 'supertest';
import app from '../app.js';

import { findUserInMongo } from '../services/userService.js';
import { findUserInFirebase } from '../services/authService.js';
import PreUser from '../models/PreUser.js';
import { createPreUser, findPreUserByEmail } from '../services/preUserService.js';
import { createSubscriptionIntent } from '../services/paymentService.js';

jest.mock('../services/userService.js');
jest.mock('../services/authService.js');
jest.mock('../services/paymentService.js');
jest.mock('../services/preUserService.js');
jest.mock('../models/PreUser.js');
jest.mock('firebase-admin', () => ({
  apps: [],
  initializeApp: jest.fn(),
  credential: { cert: jest.fn() },
  auth: jest.fn(() => ({ getUserByEmail: jest.fn() }))
}));

beforeEach(() => {
  jest.resetAllMocks();
});

describe('Registro', () => {
  test('verificarContacto crea PreUser y responde new', async () => {
    findUserInMongo.mockResolvedValue({ user: null, error: null });
    findUserInFirebase.mockResolvedValue({ user: null, error: null });
    findPreUserByEmail.mockResolvedValue({ preUser: null, error: null });
    createPreUser.mockResolvedValue({ preUser: { _id: 'pre1' }, error: null });

    const res = await request(app)
      .post('/registro/contacto')
      .send({
        name: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phoneNumber: '123',
        jobTitle: 'Dev'
      });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'new', preUserId: 'pre1' });
    expect(createPreUser).toHaveBeenCalled();
  });

  test('verificarContacto reutiliza PreUser existente', async () => {
    findUserInMongo.mockResolvedValue({ user: null, error: null });
    findUserInFirebase.mockResolvedValue({ user: null, error: null });
    findPreUserByEmail.mockResolvedValue({ preUser: { _id: 'pre1' }, error: null });

    const res = await request(app)
      .post('/registro/contacto')
      .send({
        name: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phoneNumber: '123',
        jobTitle: 'Dev'
      });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'new', preUserId: 'pre1' });
    expect(createPreUser).not.toHaveBeenCalled();
  });

  test('verificarContacto no crea PreUser si usuario existe en User', async () => {
    findPreUserByEmail.mockResolvedValue({ preUser: null, error: null });
    findUserInMongo.mockResolvedValue({ user: { _id: 'u1' }, error: null });
    findUserInFirebase.mockResolvedValue({ user: null, error: null });

    const res = await request(app)
      .post('/registro/contacto')
      .send({
        name: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phoneNumber: '123',
        jobTitle: 'Dev'
      });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ status: 'pendingAuth', user: { _id: 'u1' } });
    expect(createPreUser).not.toHaveBeenCalled();
  });

  test('iniciarPago retorna client_secret', async () => {
    const preUser = {
      _id: 'pre1',
      name: 'John',
      lastName: 'Doe',
      email: 'john@example.com'
    };
    PreUser.findById.mockReturnValue({
      lean: () => Promise.resolve(preUser)
    });
    createSubscriptionIntent.mockResolvedValue({ client_secret: 'secret1' });

    const res = await request(app)
      .post('/registro/pago')
      .send({ preUserId: 'pre1', plan: 'monthly' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ client_secret: 'secret1' });
  });
});
