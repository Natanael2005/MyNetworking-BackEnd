import request from 'supertest';
import app from '../app.js';

import stripe from '../config/stripe.js';
import PreUser from '../models/PreUser.js';
import User from '../models/User.js';

jest.mock('../config/stripe.js');
jest.mock('../models/PreUser.js');
jest.mock('../models/User.js');
jest.mock('firebase-admin', () => ({
  apps: [],
  initializeApp: jest.fn(),
  credential: { cert: jest.fn() },
  auth: jest.fn(() => ({ getUserByEmail: jest.fn() }))
}));

beforeEach(() => {
  jest.resetAllMocks();
});

describe('Webhook', () => {
  test('procesa pago exitoso', async () => {
    const eventBody = Buffer.from('{}');
    const event = {
      type: 'invoice.paid',
      data: { object: { customer: 'cus_123', subscription: 'sub_123', client_reference_id: 'pre1' } }
    };
    stripe.webhooks = { constructEvent: jest.fn(() => event) };
    stripe.subscriptions = { retrieve: jest.fn() };

    const preUser = { _id: 'pre1', name: 'John', lastName: 'Doe', email: 'john@example.com' };
    PreUser.findById.mockReturnValue({
      lean: () => Promise.resolve(preUser)
    });
    PreUser.findByIdAndDelete.mockReturnValue({ exec: () => Promise.resolve() });
    User.findOneAndUpdate.mockReturnValue({ exec: () => Promise.resolve() });

    const res = await request(app)
      .post('/webhook/stripe')
      .set('stripe-signature', 'sig')
      .set('Content-Type', 'application/json')
      .send(eventBody);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ received: true });
    expect(User.findOneAndUpdate).toHaveBeenCalled();
    expect(PreUser.findByIdAndDelete).toHaveBeenCalled();
  });
});
