import express from 'express';
import cors from 'cors';
import registroRoutes from './routes/registro.js';
import webhookRoutes  from './routes/webhook.js';
import stripeRoutes from './routes/stripe.js';

const app = express();

// Webhook debe usar express.raw, así que montamos primero
app.use('/webhook', webhookRoutes);

app.use(cors());
app.use(express.json());
app.use('/registro', registroRoutes);
app.use('/stripe', stripeRoutes);

export default app;
