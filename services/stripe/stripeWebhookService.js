import stripe from '../../config/stripe.js';
import { findPreUserById, deletePreUserById } from '../mongoDb/preUserService.js';
import { upsertUserFromPreUser } from '../mongoDb/userService.js';


/**
 * Procesa el evento recibido desde Stripe.
 * @param {Object} event - Evento enviado por Stripe.
 */
export async function processStripeEvent(event) {
  try {
    switch (event.type) {
      case 'invoice.paid':
        console.log(`Evento recibido: ${event.type}`);
        await handlePaymentSucceeded(event);
        break;
        
      default:
        // Log informativo para eventos no manejados
        console.log(`Evento no manejado: ${event.type}`);
    }
  } catch (error) {
    console.error('❌ Error en processStripeEvent:', error);
  }
}

/**
 * Maneja eventos de pago exitoso.
 * @param {Object} event - Evento de Stripe.
 */
async function handlePaymentSucceeded(event) {
  const data = event.data.object;
  
  // Extraer datos iniciales
  let customerId = data.customer;
  let subscriptionId = data.subscription || data.metadata?.subscriptionId;
  let preUserId = data.client_reference_id || data.metadata?.preUserId;

  // Intentar recuperar preUserId desde la suscripción si no está en el evento
  if (!preUserId && subscriptionId) {
    try {
      const sub = await stripe.subscriptions.retrieve(subscriptionId);
      preUserId = sub.metadata?.preUserId;
    } catch (subErr) {
      console.error('❌ Error obteniendo metadata desde la suscripción:', subErr);
    }
  }

  if (!customerId || !subscriptionId || !preUserId) {
    console.error('❌ Datos críticos faltantes en evento de Stripe:', {
      customerId,
      subscriptionId,
      preUserId
    });
    return;
  }

  // Procesar la conversión de PreUser a User
  const { preUser, error: preUserError } = await findPreUserById(preUserId);
  if (preUserError) return;
  if (!preUser) {
    console.error('⚠️ PreUser no encontrado para id:', preUserId);
    return;
  }

  const { user, error: upsertError } = await upsertUserFromPreUser(preUser, customerId, subscriptionId);
  if (upsertError) return;

  const { deleted, error: deleteError } = await deletePreUserById(preUserId);
  if (deleteError) return;
  if (!deleted) {
    console.warn(`⚠️ No se eliminó el PreUser con id ${preUserId}, requiere limpieza manual.`);
  }

  console.log(`✅ Usuario ${user.email} registrado por webhook`);
}
