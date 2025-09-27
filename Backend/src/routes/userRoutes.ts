import { Router } from 'express';
import { validationResult } from 'express-validator';
import { createUser, deleteUser, getUserById, getUsers, login, updatePassword, updateUserInstitution } from '../controllers/userController';
import { authenticateToken, requireRole, requireSelfOrAdmin } from '../middleware/auth';
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

/**
 * @openapi
 * /api/login:
 *   post:
 *     summary: Iniciar sesión de usuario
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: joelgutierrez@networklab.com
 *               password:
 *                 type: string
 *                 example: admin123
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso
 *       401:
 *         description: Credenciales inválidas
 */
router.post('/login', login);

/**
 * @openapi
 * /api/users:
 *   post:
 *     summary: Crear un nuevo usuario
 *     tags:
 *       - Users
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
 *         description: Usuario creado exitosamente
 */
router.post('/users', createUser);

/**
 * @openapi
 * /api/users:
 *   get:
 *     summary: Listar usuarios con paginación
 *     tags:
 *       - Users
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Número de página (default 0)
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *         description: Tamaño de página (default 5)
 *     responses:
 *       200:
 *         description: Lista de usuarios
 */
router.get('/users', getUsers);

/**
 * @openapi
 * /api/users/{id}:
 *   get:
 *     summary: Obtener usuario por ID
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *       404:
 *         description: Usuario no encontrado
 */
router.get('/users/:id', getUserById);

/**
 * @openapi
 * /api/users/{id}/password:
 *   put:
 *     summary: Actualizar contraseña de un usuario
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Contraseña actualizada correctamente
 *       401:
 *         description: Contraseña actual incorrecta
 *       403:
 *         description: No autorizado
 */
router.put(
    '/users/:id/password', authenticateToken, requireSelfOrAdmin, changePasswordValidator, validate, updatePassword);

/**
 * @openapi
 * /api/users/{id}/institution:
 *   put:
 *     summary: Asignar institución a un usuario
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               institution_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Institución asignada exitosamente
 *       403:
 *         description: No autorizado
 */
router.put('/users/:id/institution', authenticateToken, requireSelfOrAdmin, updateUserInstitution);

/**
 * @openapi
 * /api/users/{id}:
 *   delete:
 *     summary: Eliminar un usuario (solo admin)
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del usuario a eliminar
 *     responses:
 *       200:
 *         description: Usuario eliminado correctamente
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado (se requiere admin)
 *       404:
 *         description: Usuario no encontrado
 */
router.delete('/users/:id', authenticateToken, requireRole(['admin']), deleteUser);


export default router;
