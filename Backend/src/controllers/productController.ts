import { Request, Response } from 'express';
import { pool } from '../config/database';

export async function listProducts(req: Request, res: Response) {
  try {
    const [rows]: any = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
    return res.json({ success: true, data: rows });
  } catch (err: any) {
    console.error('listProducts error', err);
    return res.status(500).json({ success: false, message: err.message || 'Internal error' });
  }
}

export async function createProduct(req: Request, res: Response) {
  try {
    const { name, description, price, image_url, supplier_id } = req.body;
    if (!name || price === undefined) return res.status(400).json({ success: false, message: 'name and price required' });

    const [result]: any = await pool.query(
      'INSERT INTO products (name, description, price, image_url, supplier_id) VALUES (?, ?, ?, ?, ?)',
      [name, description || null, price, image_url || null, supplier_id || null]
    );

    return res.status(201).json({ success: true, data: { id: result.insertId } });
  } catch (err: any) {
    console.error('createProduct error', err);
    return res.status(500).json({ success: false, message: err.message || 'Internal error' });
  }
}

export async function getProductById(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const [rows]: any = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    if (!rows || rows.length === 0) return res.status(404).json({ success: false, message: 'Product not found' });
    return res.json({ success: true, data: rows[0] });
  } catch (err: any) {
    console.error('getProductById error', err);
    return res.status(500).json({ success: false, message: err.message || 'Internal error' });
  }
}
