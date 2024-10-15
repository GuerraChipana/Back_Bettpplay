import express from 'express';
import { loginController } from '../controllers/authController.js';

const router = express.Router();

// Esta ruta no debe requerir autenticación
router.post('/login', loginController);

export default router;
