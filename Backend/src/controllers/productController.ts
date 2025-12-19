import { Request, Response } from 'express';
import { pool } from '../config/database';
import { ResultSetHeader, RowDataPacket, hasMessage } from '../types';

export async function listProducts(req: Request, res: Response) {
  try {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM products ORDER BY created_at DESC');
    return res.json({ success: true, data: rows });
  } catch (err: unknown) {
    console.error('listProducts error', err);
    const errorMessage = hasMessage(err) ? err.message : 'Internal error';
    return res.status(500).json({ success: false, message: errorMessage });
  }
}

export async function createProduct(req: Request, res: Response) {
  try {
    const { name, description, price, image_url, supplier_id } = req.body;
    if (!name || price === undefined) return res.status(400).json({ success: false, message: 'name and price required' });

    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO products (name, description, price, image_url, supplier_id) VALUES (?, ?, ?, ?, ?)',
      [name, description || null, price, image_url || null, supplier_id || null]
    );

    return res.status(201).json({ success: true, data: { id: result.insertId } });
  } catch (err: unknown) {
    console.error('createProduct error', err);
    const errorMessage = hasMessage(err) ? err.message : 'Internal error';
    return res.status(500).json({ success: false, message: errorMessage });
  }
}

export async function getProductById(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM products WHERE id = ?', [id]);
    if (!rows || rows.length === 0) return res.status(404).json({ success: false, message: 'Product not found' });
    return res.json({ success: true, data: rows[0] });
  } catch (err: unknown) {
    console.error('getProductById error', err);
    const errorMessage = hasMessage(err) ? err.message : 'Internal error';
    return res.status(500).json({ success: false, message: errorMessage });
  }
}
