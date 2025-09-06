import { Request, Response } from 'express';
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