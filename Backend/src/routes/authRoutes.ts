import { Router } from 'express';
import { AuthController } from '../controllers/authController';

const router = Router();

// Rutas de autenticación
router.post('/auth/register', AuthController.register);
router.post('/auth/login', AuthController.login);
router.post('/auth/refresh', AuthController.refreshToken); // ← NUEVA RUTA

export default router;