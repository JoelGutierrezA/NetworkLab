import { Router } from 'express';
import { createUser, getUserById, getUsers, login, updatePassword } from '../controllers/userController';

const router = Router();

// Rutas de autenticación
router.post('/login', login);

// Rutas de usuarios
router.post('/users', createUser);
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id/password', updatePassword);

export default router;
