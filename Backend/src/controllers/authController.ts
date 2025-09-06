import { Request, Response } from 'express';
import { UserModel } from '../models/User';
import { AuthUtils } from '../utils/auth';

export class AuthController {
  // Registrar nuevo usuario
    static async register(req: Request, res: Response) {
    try {
        const { email, password, first_name, last_name, role, phone, bio } = req.body;

        // Verificar si el usuario ya existe
        const existingUser = await UserModel.findByEmail(email);
        if (existingUser) {
        return res.status(400).json({ 
            success: false, 
            message: 'El usuario ya existe' 
        });
        }

        // Hashear password
        const password_hash = await AuthUtils.hashPassword(password);

        // Crear usuario
        const newUser = await UserModel.create({
        email,
        password_hash,
        role: role || 'student',
        first_name,
        last_name,
        phone,
        bio
        });

        // Generar token
        const token = AuthUtils.generateToken(newUser.id!, email, newUser.role);

        res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: {
            user: {
            id: newUser.id,
            email: newUser.email,
            first_name: newUser.first_name,
            last_name: newUser.last_name,
            role: newUser.role
            },
            token
        }
        });

    } catch (error: any) {
        res.status(500).json({ 
        success: false, 
        message: error.message 
        });
    }
    }

    // Login de usuario
    static async login(req: Request, res: Response) {
    try {
        const { email, password } = req.body;

        // Buscar usuario
        const user = await UserModel.findByEmail(email);
        if (!user) {
        return res.status(401).json({ 
            success: false, 
            message: 'Credenciales inválidas' 
        });
        }

        // Verificar password
        const isValidPassword = await AuthUtils.comparePassword(
        password, 
        user.password_hash
        );

        if (!isValidPassword) {
        return res.status(401).json({ 
            success: false, 
            message: 'Credenciales inválidas' 
        });
        }

        // Generar token
        const token = AuthUtils.generateToken(user.id!, user.email, user.role);

        res.json({
        success: true,
        message: 'Login exitoso',
        data: {
            user: {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            role: user.role
            },
            token
        }
        });

    } catch (error: any) {
        res.status(500).json({ 
        success: false, 
        message: error.message 
        });
    }
    }
}