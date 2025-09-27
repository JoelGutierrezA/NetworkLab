import { Router } from 'express';
import { AuthController } from '../controllers/authController';

const router = Router();

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *       400:
 *         description: El usuario ya existe
 */
router.post('/auth/register', AuthController.register);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión de usuario
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso
 *       401:
 *         description: Credenciales inválidas
 */
router.post('/auth/login', AuthController.login);

/**
 * @openapi
 * /api/auth/refresh:
 *   post:
 *     summary: Refrescar token JWT
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Token refrescado exitosamente
 *       401:
 *         description: Token inválido o no enviado
 */
router.post('/auth/refresh', AuthController.refreshToken);

export default router;
