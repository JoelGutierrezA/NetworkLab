import bcrypt from 'bcryptjs';
import { Router } from 'express';
import pool from '../config/database';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

/**
 * @openapi
 * /api/laboratories:
 *   get:
 *     summary: Obtener todos los laboratorios
 *     tags:
 *       - Laboratories
 *     responses:
 *       200:
 *         description: Lista de laboratorios
 */
router.get('/laboratories', async (req, res) => {
  try {
    const [rows]: any = await pool.query(
      `SELECT id, institution_id, name, description, location, contact_email, website, research_areas
       FROM laboratories
       ORDER BY name ASC`
    );
    res.json({ success: true, laboratories: rows });
  } catch (error) {
    console.error('❌ Error obteniendo TODOS los laboratorios:', error);
    res.status(500).json({ success: false, message: 'Error obteniendo laboratorios' });
  }
});

/**
 * @openapi
 * /api/institutions/{id}/laboratories:
 *   get:
 *     summary: Obtener laboratorios asociados a una institución
 *     tags:
 *       - Laboratories
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de laboratorios
 */
router.get('/institutions/:id/laboratories', async (req, res) => {
  try {
    const { id } = req.params;

    const [rows]: any = await pool.query(
      `SELECT id, name, description, location, contact_email, website, research_areas 
       FROM laboratories
       WHERE institution_id = ?`,
      [id]
    );

    res.json({ success: true, laboratories: rows });
  } catch (error) {
    console.error('❌ Error obteniendo laboratorios:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo laboratorios asociados a la institución',
    });
  }
});

/**
 * @openapi
 * /api/laboratories/{id}:
 *   get:
 *     summary: Obtener detalle de un laboratorio
 *     tags:
 *       - Laboratories
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalle del laboratorio
 */
router.get('/laboratories/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [rows]: any = await pool.query(
      `SELECT id, name, description, location, contact_email, website, research_areas, institution_id 
       FROM laboratories 
       WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: 'Laboratorio no encontrado' });
    }

    res.json({ success: true, laboratory: rows[0] });
  } catch (error) {
    console.error('❌ Error obteniendo laboratorio:', error);
    res
      .status(500)
      .json({ success: false, message: 'Error obteniendo laboratorio' });
  }
});

/**
 * @openapi
 * /api/institutions/{id}/laboratories:
 *   post:
 *     summary: Crear un nuevo laboratorio asociado a una institución
 *     tags:
 *       - Laboratories
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
 *               description:
 *                 type: string
 *               location:
 *                 type: string
 *               contact_email:
 *                 type: string
 *               website:
 *                 type: string
 *               research_areas:
 *                 type: string
 *     responses:
 *       200:
 *         description: Laboratorio creado correctamente
 *       400:
 *         description: Faltan campos obligatorios
 */
router.post('/institutions/:id/laboratories', authenticateToken, requireRole(['admin']), async (req, res) => {
    const connection = await pool.getConnection();
    try {
    const { id } = req.params;
    const { name, description, location, contact_email, website, research_areas,
        adminEmail, adminPassword, adminFirstName, adminLastName } = req.body;

    if (!name || !description) {
        return res.status(400).json({
        success: false,
        message: 'El nombre y la descripción son obligatorios.',
        });
    }

    await connection.beginTransaction();

    let directorId: number | null = null;

    // Si vienen credenciales para el admin del laboratorio, crear el usuario y asignarle rol lab_manager
    if (adminEmail && adminPassword) {
      // verificar existencia de email
      const [existingUsers]: any = await connection.query('SELECT id FROM users WHERE email = ?', [adminEmail]);
      if (existingUsers.length > 0) {
        await connection.rollback();
        return res.status(400).json({ success: false, message: 'El correo del admin ya está registrado' });
      }

      const password_hash = await bcrypt.hash(adminPassword, 10);
      const [userResult]: any = await connection.query(
        'INSERT INTO users (email, password_hash, first_name, last_name) VALUES (?, ?, ?, ?)',
        [adminEmail, password_hash, adminFirstName || '', adminLastName || '']
      );
      directorId = userResult.insertId;

      // obtener role_id para lab_manager; crear si no existe
      const [roleRows]: any = await connection.query('SELECT id FROM roles WHERE name = ?', ['lab_manager']);
      let roleId: number;
      if (roleRows.length === 0) {
        const [r]: any = await connection.query('INSERT INTO roles (name, description) VALUES (?, ?)', ['lab_manager', 'Laboratory manager']);
        roleId = r.insertId;
      } else {
        roleId = roleRows[0].id;
      }

      // limpiar asignaciones automáticas y asignar esta institución al usuario como lab_manager
      await connection.query('DELETE FROM institution_users WHERE user_id = ?', [directorId]);
      await connection.query('INSERT INTO institution_users (user_id, institution_id, role_id) VALUES (?, ?, ?)', [directorId, id, roleId]);
    }

    // Insertar laboratorio; si directorId es null, insertar NULL en director_id
    const insertQuery = `INSERT INTO laboratories (name, description, institution_id, director_id, location, contact_email, website, research_areas)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const [result]: any = await connection.query(insertQuery,
      [name, description, id, directorId, location, contact_email, website, research_areas]
    );

    await connection.commit();

    res.json({
      success: true,
      id: result.insertId,
      message: 'Laboratorio creado correctamente',
    });
  } catch (error) {
    console.error('❌ Error creando laboratorio:', error);
    try { await connection.rollback(); } catch (rollbackErr) { console.error('❌ Error al hacer rollback:', rollbackErr); }
    res.status(500).json({ success: false, message: 'Error creando laboratorio' });
  } finally {
    connection.release();
  }
});

/**
 * @openapi
 * /api/laboratories/{id}:
 *   put:
 *     summary: Actualizar un laboratorio
 *     tags:
 *       - Laboratories
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
 *               description:
 *                 type: string
 *               location:
 *                 type: string
 *               contact_email:
 *                 type: string
 *               website:
 *                 type: string
 *               research_areas:
 *                 type: string
 *     responses:
 *       200:
 *         description: Laboratorio actualizado correctamente
 *       404:
 *         description: Laboratorio no encontrado
 */
router.put('/laboratories/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, location, contact_email, website, research_areas } = req.body;

    if (!name || !description) {
      return res.status(400).json({ success: false, message: 'El nombre y la descripción son obligatorios.' });
    }

    const [result]: any = await pool.query(
      `UPDATE laboratories SET name = ?, description = ?, location = ?, contact_email = ?, website = ?, research_areas = ? WHERE id = ?`,
      [name, description, location, contact_email, website, research_areas, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Laboratorio no encontrado' });
    }

    res.json({ success: true, message: 'Laboratorio actualizado correctamente' });
  } catch (error) {
    console.error('❌ Error actualizando laboratorio:', error);
    res.status(500).json({ success: false, message: 'Error actualizando laboratorio' });
  }
});

/**
 * @openapi
 * /api/laboratories/{id}:
 *   delete:
 *     summary: Eliminar un laboratorio
 *     tags:
 *       - Laboratories
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
 *         description: Laboratorio eliminado correctamente
 *       404:
 *         description: Laboratorio no encontrado
 */
router.delete('/laboratories/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    const [result]: any = await pool.query(
      'DELETE FROM laboratories WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Laboratorio no encontrado' });
    }

    res.json({ success: true, message: 'Laboratorio eliminado correctamente' });
  } catch (error) {
    console.error('❌ Error eliminando laboratorio:', error);
    res.status(500).json({ success: false, message: 'Error eliminando laboratorio' });
  }
});

export default router;
