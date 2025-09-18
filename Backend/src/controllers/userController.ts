import { Request, Response } from 'express';
import { pool } from '../config/database';
import { User, UserModel } from '../models/User';

export class UserController {
    // Crear usuario
    static async createUser(req: Request, res: Response) {
    try {
        const user: User = req.body;
        const newUser = await UserModel.create(user);
        res.status(201).json({ success: true, data: newUser });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
    }

    // Obtener usuario por ID
    static async getUserById(req: Request, res: Response) {
    try {
        const id = parseInt(req.params.id);
        const user = await UserModel.findById(id);
        
        if (!user) {
        return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }
        
        res.json({ success: true, data: user });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
    }

    // Obtener usuario por email
    static async getUserByEmail(req: Request, res: Response) {
    try {
        const { email } = req.query;
        if (!email || typeof email !== 'string') {
        return res.status(400).json({ success: false, message: 'Email es requerido' });
        }
        
        const user = await UserModel.findByEmail(email);
        
        if (!user) {
        return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }
        
        res.json({ success: true, data: user });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
    }
}

export const getUsers = async (req: Request, res: Response) => {
    try {
    // Leer query params, con valores por defecto
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;

    const [rows] = await pool.query(
      'SELECT * FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [limit, offset]
    );

    // Obtener también el total de usuarios para frontend
    const [countResult] = await pool.query('SELECT COUNT(*) as total FROM users');
    const total = (countResult as any)[0].total;

    res.json({
        success: true,
        total,
        limit,
        offset,
        users: rows
    });
    } catch (error) {
    console.error('❌ Error en getUsers:', error);
    res.status(500).json({ success: false, message: 'Error al obtener usuarios' });
    }
};