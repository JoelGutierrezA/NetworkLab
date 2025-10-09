import bcrypt from 'bcryptjs';
import { Router } from 'express';
import pool from '../config/database';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

/**
 * @openapi
 * /api/institutions:
 *   get:
 *     summary: Obtener todas las instituciones
 *     tags:
 *       - Institutions
 *     responses:
 *       200:
 *         description: Lista de instituciones
 */
router.get('/institutions', async (req, res) => {
    try {
    const [rows]: any = await pool.query(
        'SELECT id, name FROM institutions ORDER BY name ASC'
    );
    res.json({ success: true, institutions: rows });
    } catch (error) {
    console.error('❌ Error obteniendo instituciones:', error);
    res.status(500).json({ success: false, message: 'Error obteniendo instituciones' });
    }
});

// Rutas de Laboratories fueron movidas a laboratoriesRoutes.ts

/**
 * @openapi
 * /api/institutions:
 *   post:
 *     summary: Crear una nueva institución
 *     tags:
 *       - Institutions
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Institución creada correctamente
 *       400:
 *         description: El nombre es obligatorio
 */
router.post('/institutions', authenticateToken, requireRole(['admin']), async (req, res) => {
    const connection = await pool.getConnection();
    try {
    const { name, adminEmail, adminPassword, adminFirstName, adminLastName } = req.body;
    if (!name) {
        return res.status(400).json({ success: false, message: 'El nombre es obligatorio' });
    }

    await connection.beginTransaction();

    const [result]: any = await connection.query(
        'INSERT INTO institutions (name) VALUES (?)',
        [name]
    );
    const institutionId = result.insertId;

    // Si se proporcionaron credenciales del admin, crearlo y asignar rol lab_manager
    if (adminEmail && adminPassword) {
        // verificar existencia de email
        const [existingUsers]: any = await connection.query('SELECT id FROM users WHERE email = ?', [adminEmail]);
        if (existingUsers.length > 0) {
        // rollback y error
        await connection.rollback();
        return res.status(400).json({ success: false, message: 'El correo ya está registrado' });
        }

        const password_hash = await bcrypt.hash(adminPassword, 10);

        const [userResult]: any = await connection.query(
        'INSERT INTO users (email, password_hash, first_name, last_name) VALUES (?, ?, ?, ?)',
        [adminEmail, password_hash, adminFirstName || '', adminLastName || '']
        );
        const userId = userResult.insertId;

        // obtener role_id para lab_manager; si no existe, crearlo
        const [roleRows]: any = await connection.query('SELECT id FROM roles WHERE name = ?', ['lab_manager']);
        let roleId: number;
        if (roleRows.length === 0) {
        const [r]: any = await connection.query('INSERT INTO roles (name, description) VALUES (?, ?)', ['lab_manager', 'Laboratory manager']);
        roleId = r.insertId;
        } else {
        roleId = roleRows[0].id;
        }

        // El trigger after insert en users pudo haber insertado institution_users con role_id=1
        // Limpiar cualquier asignación previa e insertar la correcta
        await connection.query('DELETE FROM institution_users WHERE user_id = ?', [userId]);
        await connection.query('INSERT INTO institution_users (user_id, institution_id, role_id) VALUES (?, ?, ?)', [userId, institutionId, roleId]);
    }

    await connection.commit();

    res.json({
        success: true,
        id: institutionId,
        message: 'Institución creada correctamente',
    });
    } catch (error) {
    console.error('❌ Error creando institución:', error);
    try { await connection.rollback(); } catch (rollbackErr) { console.error('❌ Error al hacer rollback:', rollbackErr); }
    res.status(500).json({ success: false, message: 'Error creando institución' });
    } finally {
    connection.release();
    }
});

/**
 * @openapi
 * /api/institutions/{id}:
 *   get:
 *     summary: Obtener institución por ID
 *     tags:
 *       - Institutions
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalle de la institución
 *       404:
 *         description: Institución no encontrada
 */
router.get('/institutions/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [rows]: any = await pool.query(
        `SELECT id, name, type, description, website, logo_url, country, city, address, created_at
            FROM institutions
            WHERE id = ?`,
        [id]
        );

        if (!rows || rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Institución no encontrada' });
        }

        res.json({ success: true, institution: rows[0] });
    } catch (error) {
        console.error('❌ Error obteniendo institución:', error);
        res.status(500).json({ success: false, message: 'Error obteniendo institución' });
    }
});

/**
 * @openapi
 * /api/institutions/{id}:
 *   put:
 *     summary: Editar el nombre de una institución
 *     tags:
 *       - Institutions
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Institución actualizada correctamente
 *       404:
 *         description: Institución no encontrada
 */
router.put('/institutions/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
    try {
    const { id } = req.params;
    const {
        name,
        type,
        description,
        website,
        country,
        city,
        address
    } = req.body;

    // Validación mínima
    if (!name) {
        return res.status(400).json({ success: false, message: 'El nombre es obligatorio' });
    }

    const [result]: any = await pool.query(
        `UPDATE institutions SET name = ?, type = ?, description = ?, website = ?, country = ?, city = ?, address = ? WHERE id = ?`,
        [name, type || null, description || null, website || null, country || null, city || null, address || null, id]
    );

    if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Institución no encontrada' });
    }

    res.json({ success: true, message: 'Institución actualizada correctamente' });
    } catch (error) {
    console.error('❌ Error actualizando institución:', error);
    res.status(500).json({ success: false, message: 'Error actualizando institución' });
    }
});

/**
 * @openapi
 * /api/institutions/{id}:
 *   delete:
 *     summary: Eliminar una institución
 *     tags:
 *       - Institutions
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Institución eliminada correctamente
 *       404:
 *         description: Institución no encontrada
 */
router.delete('/institutions/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
    try {
    const { id } = req.params;

    const [result]: any = await pool.query(
        'DELETE FROM institutions WHERE id = ?',
        [id]
    );

    if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Institución no encontrada' });
    }

    res.json({ success: true, message: 'Institución eliminada correctamente' });
    } catch (error) {
    console.error('❌ Error eliminando institución:', error);
    res.status(500).json({ success: false, message: 'Error eliminando institución' });
    }
});

// (migrated) GET /api/institutions/:id/laboratories -> laboratoriesRoutes.ts

// (migrated) GET /api/laboratories/:id -> laboratoriesRoutes.ts

// (migrated) POST /api/institutions/:id/laboratories -> laboratoriesRoutes.ts

// (migrated) PUT /api/laboratories/:id -> laboratoriesRoutes.ts

// (migrated) DELETE /api/laboratories/:id -> laboratoriesRoutes.ts

export default router;
