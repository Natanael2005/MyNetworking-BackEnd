import stripe from '../config/stripe.js';
import User from '../models/User.js';
import PreUser from '../models/PreUser.js';

export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    // express.raw inyecta Buffer en req.body
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('❌ Webhook signature error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'invoice.paid' || event.type === 'payment_intent.succeeded') {
    const data = event.data.object;

    let preUserId = data.client_reference_id || data.metadata?.preUserId;
    let subscriptionId = data.subscription || data.metadata?.subscriptionId;
    const customerId = data.customer;

    if (!preUserId && subscriptionId) {
      try {
        const sub = await stripe.subscriptions.retrieve(subscriptionId);
        preUserId = sub.metadata?.preUserId;
      } catch (subErr) {
        console.error('Error obteniendo suscripción de Stripe:', subErr);
      }
    }

    if (preUserId) {
      try {
        const preUser = await PreUser.findById(preUserId).lean();
        if (preUser) {
          await User.findOneAndUpdate(
            { email: preUser.email },
            {
              $set: {
                name: preUser.name,
                lastName: preUser.lastName,
                phoneNumber: preUser.phoneNumber,
                jobTitle: preUser.jobTitle,
                stripe_id: customerId,
                stripeSubscriptionId: subscriptionId,
                estado: 'pago_realizado'
              }
            },
            { upsert: true, new: true }
          ).exec();
          await PreUser.findByIdAndDelete(preUserId).exec();
          console.log(`✅ Usuario ${preUser.email} registrado por webhook`);
        } else {
          console.error('PreUser no encontrado para id:', preUserId);
        }
      } catch (dbErr) {
        console.error('❌ Error procesando webhook:', dbErr);
      }
    } else {
      console.error('preUserId no encontrado en evento de Stripe');
    }
  }

  // Responde inmediatamente
  res.json({ received: true });
};
