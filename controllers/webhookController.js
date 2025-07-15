import stripe from '../config/stripe.js';
import User from '../models/User.js';

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

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { name, lastName, phoneNumber, jobTitle } = session.metadata;
    const subscriptionId = session.subscription; // ID de la suscripción

    try {
      // Upsert: crea o actualiza el usuario con stripe_id & estado
      await User.findOneAndUpdate(
        { email: session.customer_email },
        {
          $set: {
            name,
            lastName,
            phoneNumber,
            jobTitle,
            stripe_id: session.customer,
            stripeSubscriptionId: subscriptionId,
            estado: 'pago_realizado'
          }
        },
        { upsert: true, new: true }
      ).exec();
      console.log(`✅ Usuario ${session.customer_email} marcado como pagado`);
    } catch (dbErr) {
      console.error('❌ Error actualizando usuario en webhook:', dbErr);
    }
  }

  // Responde inmediatamente
  res.json({ received: true });
};
