import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { pool } from '../config/database';
import { ResultSetHeader, RowDataPacket, hasMessage, isMySQLError } from '../types';

export async function createProviderWithAdmin(req: Request, res: Response) {
  let connection: Awaited<ReturnType<typeof pool.getConnection>> | null = null;
  try {
    connection = await pool.getConnection();
    const { provider, admin } = req.body;
    if (!provider || !admin) {
      return res.status(400).json({ success: false, message: 'provider and admin data required' });
    }

    await connection.beginTransaction();

    // 1) Insert supplier (we are keeping suppliers as the canonical entity)
    const [provRes] = await connection.query<ResultSetHeader>(
      'INSERT INTO suppliers (name, description, website, country, city, address) VALUES (?, ?, ?, ?, ?, ?)',
      [provider.name, provider.description || null, provider.website || null, provider.country || null, provider.city || null, provider.address || null]
    );
    const supplierId = provRes.insertId;

    // 2) Create user (admin)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(admin.password, salt);

    let userId: number;
    try {
      const [userRes] = await connection.query<ResultSetHeader>(
        'INSERT INTO users (email, password_hash, first_name, last_name, avatar_url, phone, is_verified, created_via) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [admin.email, passwordHash, admin.first_name || '', admin.last_name || '', admin.avatar_url || null, admin.phone || null, 1, 'admin']
      );
      userId = userRes.insertId;
    } catch (err: unknown) {
      // Si la columna created_via no existe en la BD (ER_BAD_FIELD_ERROR), reintentar sin ella
      if (isMySQLError(err) && err.code === 'ER_BAD_FIELD_ERROR' && String(err.sqlMessage).includes('created_via')) {
        console.warn('created_via column not found, retrying INSERT without it');
        const [userRes2] = await connection.query<ResultSetHeader>(
          'INSERT INTO users (email, password_hash, first_name, last_name, avatar_url, phone, is_verified) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [admin.email, passwordHash, admin.first_name || '', admin.last_name || '', admin.avatar_url || null, admin.phone || null, 1]
        );
        userId = userRes2.insertId;
      } else {
        throw err;
      }
    }
    // 3) Ensure role provider_admin exists (create if missing) and get roleId
    let [roleRows] = await connection.query<RowDataPacket[]>('SELECT id FROM roles WHERE name = ?', ['provider_admin']);
    let roleId: number;
    if (!roleRows || roleRows.length === 0) {
      const [r] = await connection.query<ResultSetHeader>('INSERT INTO roles (name, description) VALUES (?, ?)', ['provider_admin', 'Provider administrator']);
      roleId = r.insertId;
    } else {
      roleId = roleRows[0].id as number;
    }

    // 4) Clean up any trigger-inserted organization_users (e.g., the after_user_insert trigger may have added an 'institution' membership with default role student)
    await connection.query("DELETE FROM organization_users WHERE user_id = ? AND organization_type = 'institution'", [userId]);

    // 5) Insert into organization_users (polymorphic membership) with organization_type 'provider'
    await connection.query(
      'INSERT INTO organization_users (user_id, organization_type, organization_id, role_id) VALUES (?, ?, ?, ?)',
      [userId, 'provider', supplierId, roleId]
    );

    await connection.commit();

    return res.status(201).json({ success: true, data: { supplierId, userId } });
  } catch (err: unknown) {
    try {
      if (connection) await connection.rollback();
    } catch (rollbackErr) {
      console.error('rollback error:', rollbackErr);
    }
    console.error('createProviderWithAdmin error', err);
    const errorMessage = hasMessage(err) ? err.message : 'Internal error';
    return res.status(500).json({ success: false, message: errorMessage });
  } finally {
    try {
      if (connection) await connection.release();
    } catch (releaseErr) {
      console.warn('error releasing connection', releaseErr);
    }
  }
}

export async function listSuppliers(req: Request, res: Response) {
  try {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM suppliers ORDER BY created_at DESC');
    return res.json({ success: true, data: rows });
  } catch (err: unknown) {
    console.error('listSuppliers error', err);
    const errorMessage = hasMessage(err) ? err.message : 'Internal error';
    return res.status(500).json({ success: false, message: errorMessage });
  }
}

export async function getSupplierById(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM suppliers WHERE id = ?', [id]);
    if (!rows || rows.length === 0) return res.status(404).json({ success: false, message: 'Supplier not found' });
    return res.json({ success: true, data: rows[0] });
  } catch (err: unknown) {
    console.error('getSupplierById error', err);
    const errorMessage = hasMessage(err) ? err.message : 'Internal error';
    return res.status(500).json({ success: false, message: errorMessage });
  }
}

export async function createSupplier(req: Request, res: Response) {
  try {
    const { name, description, website, country, city, address } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Name required' });
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO suppliers (name, description, website, country, city, address) VALUES (?, ?, ?, ?, ?, ?)',
      [name, description || null, website || null, country || null, city || null, address || null]
    );
    return res.status(201).json({ success: true, data: { id: result.insertId } });
  } catch (err: unknown) {
    console.error('createSupplier error', err);
    const errorMessage = hasMessage(err) ? err.message : 'Internal error';
    return res.status(500).json({ success: false, message: errorMessage });
  }
}

export async function updateSupplier(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const { name, description, website, country, city, address } = req.body;
    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE suppliers SET name = ?, description = ?, website = ?, country = ?, city = ?, address = ? WHERE id = ?',
      [name, description || null, website || null, country || null, city || null, address || null, id]
    );
    return res.json({ success: true, changedRows: result.affectedRows });
  } catch (err: unknown) {
    console.error('updateSupplier error', err);
    const errorMessage = hasMessage(err) ? err.message : 'Internal error';
    return res.status(500).json({ success: false, message: errorMessage });
  }
}

export async function deleteSupplier(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const [result] = await pool.query<ResultSetHeader>('DELETE FROM suppliers WHERE id = ?', [id]);
    return res.json({ success: true, affectedRows: result.affectedRows });
  } catch (err: unknown) {
    console.error('deleteSupplier error', err);
    const errorMessage = hasMessage(err) ? err.message : 'Internal error';
    return res.status(500).json({ success: false, message: errorMessage });
  }
}
