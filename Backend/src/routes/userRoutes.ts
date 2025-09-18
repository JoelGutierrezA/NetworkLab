import { Router } from 'express';
import { getUsers, UserController } from '../controllers/userController';

const router = Router();

// Crear usuario
router.post('/users', UserController.createUser);

// Obtener usuario por ID
router.get('/users/:id', UserController.getUserById);

// Obtener usuario por email (usando query param ?email=)
router.get('/users/email/:email', UserController.getUserByEmail);

// Listar todos los usuarios
router.get('/users', getUsers);

export default router;