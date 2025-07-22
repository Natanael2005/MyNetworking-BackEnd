import { getActiveSubscriptionPlans } from '../services/stripe/planService.js';

export async function listPlans(req, res) {
  try {
    const plans = await getActiveSubscriptionPlans();
    res.json(plans);
  } catch (err) {
    console.error('Error listando planes:', err.message);
    res.status(500).json({ message: 'Error obteniendo los planes', error: err.message });
  }
}
