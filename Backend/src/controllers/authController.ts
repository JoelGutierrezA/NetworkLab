import { Request, Response } from 'express';
import { UserModel } from '../models/User';
import { AuthUtils } from '../utils/AuthUtils';

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
        
        console.log('✅ Registro exitoso, enviando respuesta');
        
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
            }
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
    console.log('🔐 Login attempt:', req.body);

    try {
        const { email, password } = req.body;

        // Buscar usuario
        const user = await UserModel.findByEmail(email);
        console.log('Usuario encontrado:', user);
        
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
        console.log('Password válido:', isValidPassword);

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

    // Refresh token
    static async refreshToken(req: Request, res: Response) {
    console.log('🔄 Refresh token attempt');
    console.log('Headers:', req.headers);

    try {
        // 1. Obtener el token del header Authorization
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: 'Token de refresco requerido en header Authorization'
        });
        }

        // Verificar que sea formato "Bearer TOKEN"
        if (!authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'Formato de token inválido. Use: Bearer TOKEN'
        });
        }

        const oldToken = authHeader.substring(7); // Remover "Bearer "

        // 2. Decodificar el token
        const decoded = AuthUtils.decodeToken(oldToken);
        
        if (!decoded || !decoded.userId) {
        return res.status(401).json({
            success: false,
            message: 'Token inválido'
        });
        }

        // 3. Buscar usuario en la base de datos
        const user = await UserModel.findById(decoded.userId);
        
        if (!user) {
        return res.status(401).json({
            success: false,
            message: 'Usuario no encontrado'
        });
        }

        // 4. Generar NUEVO token
        const newToken = AuthUtils.generateToken(
        user.id!,
        user.email,
        user.role
        );

        console.log('✅ Token refrescado exitosamente para usuario:', user.email);

        // 5. Responder con el nuevo token
        res.json({
        success: true,
        message: 'Token refrescado exitosamente',
        data: {
            token: newToken,
            user: {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            role: user.role
            }
        }
        });

    } catch (error: any) {
        console.error('❌ Error en refreshToken:', error);
        res.status(500).json({
        success: false,
        message: 'Error al refrescar el token'
        });
    }
    }

    // Verificar token (endpoint adicional para verificar validez del token)
    static async verifyToken(req: Request, res: Response) {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'Token requerido'
        });
        }

        const token = authHeader.substring(7);
        const decoded = AuthUtils.decodeToken(token);

        if (!decoded || !decoded.userId) {
        return res.status(401).json({
            success: false,
            message: 'Token inválido'
        });
        }

        // Verificar si el usuario aún existe en la base de datos
        const user = await UserModel.findById(decoded.userId);
        if (!user) {
        return res.status(401).json({
            success: false,
            message: 'Usuario no encontrado'
        });
        }

        res.json({
        success: true,
        message: 'Token válido',
        data: {
            user: {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            role: user.role
            }
        }
        });

    } catch (error: any) {
        res.status(500).json({
        success: false,
        message: 'Error al verificar el token'
        });
    }
    }

    // Logout (opcional - normalmente se maneja del lado del cliente)
    static async logout(req: Request, res: Response) {
    try {
        res.json({
        success: true,
        message: 'Logout exitoso'
        });

    } catch (error: any) {
        res.status(500).json({
        success: false,
        message: 'Error en logout'
        });
    }
    }
}