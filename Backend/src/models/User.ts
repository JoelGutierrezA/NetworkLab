import { pool } from '../config/database';
import { ResultSetHeader, RowDataPacket } from '../types';

export interface User {
  id?: number;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  bio?: string;
  phone?: string;
  institution_id?: number;
  is_verified?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export class UserModel {
  // Crear un nuevo usuario
  static async create(user: User): Promise<User> {
    const query = `
      INSERT INTO users (email, password_hash, first_name, last_name, avatar_url, bio, phone)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      user.email,
      user.password_hash,
      user.first_name,
      user.last_name,
      user.avatar_url || null,
      user.bio || null,
      user.phone || null
    ];

    const [result] = await pool.execute<ResultSetHeader>(query, values);
    return { ...user, id: result.insertId };
  }

  // Encontrar usuario por email
  static async findByEmail(email: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE email = ?';
    const [rows] = await pool.execute<RowDataPacket[]>(query, [email]);
    return rows.length > 0 ? (rows[0] as User) : null;
  }

  // Encontrar usuario por ID
  static async findById(id: number): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE id = ?';
    const [rows] = await pool.execute<RowDataPacket[]>(query, [id]);
    return rows.length > 0 ? (rows[0] as User) : null;
  }

  // Actualizar usuario
  static async update(id: number, updates: Partial<User>): Promise<boolean> {
    const fields = Object.keys(updates);
    if (fields.length === 0) return false;

    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = [...Object.values(updates), id];

    const query = `UPDATE users SET ${setClause} WHERE id = ?`;
    const [result] = await pool.execute<ResultSetHeader>(query, values);

    return result.affectedRows > 0;
  }

  // Eliminar usuario
  static async delete(id: number): Promise<boolean> {
    const query = 'DELETE FROM users WHERE id = ?';
    const [result] = await pool.execute<ResultSetHeader>(query, [id]);
    return result.affectedRows > 0;
  }
}
