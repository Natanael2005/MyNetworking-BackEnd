import express from 'express';
import { verificarContacto, iniciarPago } from '../controllers/registroController.js';

const router = express.Router();
router.post('/contacto', verificarContacto);
router.post('/pago', iniciarPago);
export default router;
