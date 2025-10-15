import bcrypt from 'bcrypt';
import { Router } from 'express';
import pool from '../config/database';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();
const isDev = process.env.NODE_ENV !== 'production';

function mapMysqlError(err: any) {
  const code = err?.code || err?.errno || null;
  // Default
  let status = 500;
  let message = 'Error en la base de datos';

  if (!code) return { status, message };

  // Common MySQL error codes
  switch (code) {
    case 'ER_DUP_ENTRY':
      status = 409;
      message = 'Entrada duplicada en la base de datos';
      break;
    case 'ER_BAD_NULL_ERROR':
      status = 400;
      message = 'Falta un campo requerido';
      break;
    case 'ER_NO_REFERENCED_ROW_2':
    case 'ER_ROW_IS_REFERENCED_2':
      status = 422;
      message = 'Violación de integridad referencial (clave foránea)';
      break;
    case 'ER_BAD_FIELD_ERROR':
      status = 400;
      message = 'Campo inválido en la consulta';
      break;
    default:
      // leave defaults
      break;
  }

  return { status, message };
}

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
// Obtener todos los laboratorios
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
    const resp: any = { success: false, message: 'Error obteniendo laboratorios' };
    if (isDev) resp.details = (error as any)?.message || String(error);
    res.status(500).json(resp);
  }
});

/**
 * @openapi
 * /api/institutions/{id}/laboratories:
 *   get:
 *     summary: Obtener laboratorios de una institución
 *     tags:
 *       - Laboratories
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Laboratorios de la institución
 *       404:
 *         description: Institución no encontrada
 */
// Obtener laboratorios por institución
router.get('/institutions/:id/laboratories', async (req, res) => {
  try {
    const { id } = req.params;

    // validar que la institución existe
    const [instRows]: any = await pool.query('SELECT id FROM institutions WHERE id = ?', [id]);
    if (instRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Institución no encontrada' });
    }

    const [rows]: any = await pool.query(
      `SELECT id, name, description, location, contact_email, website, research_areas
        FROM laboratories
        WHERE institution_id = ?`,
      [id]
    );

    res.json({ success: true, laboratories: rows });
  } catch (error) {
    console.error('❌ Error obteniendo laboratorios:', error);
    const resp: any = { success: false, message: 'Error obteniendo laboratorios asociados a la institución' };
    if (isDev) resp.details = (error as any)?.message || String(error);
    res.status(500).json(resp);
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
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalle del laboratorio
 *       404:
 *         description: Laboratorio no encontrado
 */
// Obtener detalle de laboratorio
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
      return res.status(404).json({ success: false, message: 'Laboratorio no encontrado' });
    }

    res.json({ success: true, laboratory: rows[0] });
  } catch (error) {
    console.error('❌ Error obteniendo laboratorio:', error);
    const resp: any = { success: false, message: 'Error obteniendo laboratorio' };
    if (isDev) resp.details = (error as any)?.message || String(error);
    res.status(500).json(resp);
  }
});

/**
 * @openapi
 * /api/institutions/{id}/laboratories:
 *   post:
 *     summary: Crear un laboratorio asociado a una institución
 *     tags:
 *       - Laboratories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               adminEmail:
 *                 type: string
 *               adminPassword:
 *                 type: string
 *               adminFirstName:
 *                 type: string
 *               adminLastName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Laboratorio creado correctamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Institución no encontrada
 */
// Crear laboratorio asociado a institución
router.post('/institutions/:id/laboratories', authenticateToken, requireRole(['admin']), async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    const { name, description, location, contact_email, website, research_areas,
      adminEmail, adminPassword, adminFirstName, adminLastName } = req.body;

    if (!name || !description) {
      connection.release();
      return res.status(400).json({ success: false, message: 'El nombre y la descripción son obligatorios.' });
    }

    // validar que la institución existe para evitar violaciones de FK
    const [instRows]: any = await connection.query('SELECT id FROM institutions WHERE id = ?', [id]);
    if (instRows.length === 0) {
      connection.release();
      return res.status(404).json({ success: false, message: 'Institución no encontrada' });
    }

    await connection.beginTransaction();

    let directorId: number | null = null;

    // Crear usuario director (lab manager) si se entregan credenciales
    if (adminEmail && adminPassword) {
      const [existingUsers]: any = await connection.query('SELECT id FROM users WHERE email = ?', [adminEmail]);
      if (existingUsers.length > 0) {
        await connection.rollback();
        connection.release();
        return res.status(400).json({ success: false, message: 'El correo del admin ya está registrado' });
      }

      const password_hash = await bcrypt.hash(adminPassword, 10);
      // Intentar insertar incluyendo `created_via`. Si la columna no existe (ER_BAD_FIELD_ERROR), reintentar sin ella.
      let userResult: any;
      try {
        const [r]: any = await connection.query(
          'INSERT INTO users (email, password_hash, first_name, last_name, created_via) VALUES (?, ?, ?, ?, ?)',
          [adminEmail, password_hash, adminFirstName || '', adminLastName || '', 'admin']
        );
        userResult = r;
      } catch (insertErr) {
        // Si la columna created_via no existe, reintentar sin ella
        if ((insertErr as any)?.code === 'ER_BAD_FIELD_ERROR' && ((insertErr as any)?.sqlMessage || '').includes('created_via')) {
          console.warn('Columna `created_via` no encontrada. Reintentando insert sin esa columna.');
          const [r2]: any = await connection.query(
            'INSERT INTO users (email, password_hash, first_name, last_name) VALUES (?, ?, ?, ?)',
            [adminEmail, password_hash, adminFirstName || '', adminLastName || '']
          );
          userResult = r2;
        } else {
          throw insertErr;
        }
      }
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
      await connection.query("DELETE FROM organization_users WHERE user_id = ? AND organization_type = 'institution'", [directorId]);
      await connection.query('INSERT INTO organization_users (user_id, organization_type, organization_id, role_id) VALUES (?, ?, ?, ?)', [directorId, 'institution', id, roleId]);
    }

    // Insertar laboratorio
    const insertQuery = `INSERT INTO laboratories (name, description, institution_id, director_id, location, contact_email, website, research_areas)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const [result]: any = await connection.query(insertQuery,
      [name, description, id, directorId, location, contact_email, website, research_areas]
    );

    await connection.commit();

    res.json({ success: true, id: result.insertId, message: 'Laboratorio creado correctamente' });
  } catch (error) {
    console.error('❌ Error creando laboratorio:', error);
    // Loguear campos MySQL útiles para diagnóstico
    try {
      console.error('MySQL error code:', (error as any)?.code, 'errno:', (error as any)?.errno, 'sqlMessage:', (error as any)?.sqlMessage);
    } catch (logErr) {
      console.error('Error al loggear detalles del error:', logErr);
    }
    try { await connection.rollback(); } catch (rollbackErr) { console.error('❌ Error al hacer rollback:', rollbackErr); }
    connection.release();
    const mapped = mapMysqlError(error);
    const resp: any = { success: false, message: mapped.message || 'Error creando laboratorio' };
    if (isDev) {
      resp.details = {
        code: (error as any)?.code,
        errno: (error as any)?.errno,
        sqlMessage: (error as any)?.sqlMessage,
        message: (error as any)?.message || String(error)
      };
    }
    res.status(mapped.status || 500).json(resp);
  } finally {
    try { connection.release(); } catch (e) { /* ignore */ }
  }
});

/**
 * @openapi
 * /api/laboratories/{id}:
 *   put:
 *     summary: Actualizar laboratorio
 *     tags:
 *       - Laboratories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Laboratorio no encontrado
 */
// Actualizar laboratorio
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
    const resp: any = { success: false, message: 'Error actualizando laboratorio' };
    if (isDev) resp.details = (error as any)?.message || String(error);
    res.status(500).json(resp);
  }
});

/**
 * @openapi
 * /api/laboratories/{id}:
 *   delete:
 *     summary: Eliminar laboratorio
 *     tags:
 *       - Laboratories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Laboratorio eliminado correctamente
 *       404:
 *         description: Laboratorio no encontrado
 */
// Eliminar laboratorio
router.delete('/laboratories/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    const [result]: any = await pool.query('DELETE FROM laboratories WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Laboratorio no encontrado' });
    }

    res.json({ success: true, message: 'Laboratorio eliminado correctamente' });
  } catch (error) {
    console.error('❌ Error eliminando laboratorio:', error);
    const resp: any = { success: false, message: 'Error eliminando laboratorio' };
    if (isDev) resp.details = (error as any)?.message || String(error);
    res.status(500).json(resp);
  }
});

export default router;
