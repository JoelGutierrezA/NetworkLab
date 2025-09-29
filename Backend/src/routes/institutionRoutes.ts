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
    try {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ success: false, message: 'El nombre es obligatorio' });
    }

    const [result]: any = await pool.query(
        'INSERT INTO institutions (name) VALUES (?)',
        [name]
    );

    res.json({
        success: true,
        id: result.insertId,
        message: 'Institución creada correctamente',
    });
    } catch (error) {
    console.error('❌ Error creando institución:', error);
    res.status(500).json({ success: false, message: 'Error creando institución' });
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
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ success: false, message: 'El nombre es obligatorio' });
    }

    const [result]: any = await pool.query(
        'UPDATE institutions SET name = ? WHERE id = ?',
        [name, id]
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

export default router;
