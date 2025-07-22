import express from 'express';
import { listPlans } from '../controllers/planController.js';

const router = express.Router();
router.get('/plans', listPlans);

export default router;
