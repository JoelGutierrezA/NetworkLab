import { Router } from 'express';
import { validationResult } from 'express-validator';
import { createUser, getUserById, getUsers, login, updatePassword } from '../controllers/userController';
import { authenticateToken, requireSelfOrAdmin } from '../middleware/auth';
import { changePasswordValidator } from '../validators/user.validators';

const router = Router();

// Middleware para manejar errores de validación
function validate(req: any, res: any, next: any) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
    return res.status(400).json({
        success: false,
        message: 'Validación fallida',
        errors: errors.array(),
    });
    }
    next();
}

// Rutas de autenticación
router.post('/login', login);

// Rutas de usuarios
router.post('/users', createUser);
router.get('/users', getUsers);
router.get('/users/:id', getUserById);

// ✅ Nueva versión de la ruta de cambio de contraseña (protegida + validada)
router.put(
    '/users/:id/password',
    authenticateToken,
    requireSelfOrAdmin,
    changePasswordValidator,
    validate,
    updatePassword
);

export default router;
