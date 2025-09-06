import { Router } from 'express';
import { UserController } from '../controllers/userController';

const router = Router();

// Rutas de usuarios
router.post('/users', UserController.createUser);
router.get('/users/:id', UserController.getUserById);
router.get('/users', UserController.getUserByEmail);

export default router;