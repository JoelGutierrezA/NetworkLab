import { Request, Response } from 'express';
import pool from '../config/database';
import { UserModel } from '../models/User';
import { AuthUtils } from '../utils/AuthUtils';

export class AuthController {
    // =========================
    // Helper: obtener rol por user_id
    // =========================
    private static async getRole(userId: number): Promise<string> {
    const [rows]: any = await pool.query(
        `SELECT r.name AS role
            FROM institution_users iu
            LEFT JOIN roles r ON r.id = iu.role_id
        WHERE iu.user_id = ?
        LIMIT 1`,
        [userId]
    );
    return (rows?.[0]?.role ?? 'student').toString();
    }

    // =========================
    // Registrar nuevo usuario
    // =========================
    static async register(req: Request, res: Response) {
    try {
        const { email, password, first_name, last_name, phone, bio } = req.body;

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

        // Crear usuario (el trigger AFTER INSERT lo inserta en institution_users con role_id=1 -> student)
        const newUser = await UserModel.create({
        email,
        password_hash,
        first_name,
        last_name,
        phone,
        bio,
        role: 'student' // 👈 requerido por la interfaz User (TypeScript)
        });


        // Obtener rol real desde la BD (por si el trigger asignó student u otro flujo lo modifica)
        const role = await AuthController.getRole(newUser.id!);

        // Generar token con rol
        const token = AuthUtils.generateToken(newUser.id!, email, role);

        // Respuesta PLANA homogénea con login/refresh
        return res.status(201).json({
        success: true,
        token,
        user: {
            id: newUser.id,
            email: newUser.email,
            first_name: newUser.first_name,
            last_name: newUser.last_name,
            role
        }
        });
    } catch (error: any) {
        console.error('❌ Error en register:', error);
        return res.status(500).json({
        success: false,
        message: error?.message || 'Error en el servidor'
        });
    }
    }

    // =========================
    // Login de usuario
    // =========================
    static async login(req: Request, res: Response) {
    console.log('🔐 Login attempt:', req.body);

    try {
        const { email, password } = req.body;

        // 1) Buscar usuario (sin rol)
        const user = await UserModel.findByEmail(email);
        console.log('Usuario encontrado:', user);

        if (!user) {
        return res.status(401).json({
            success: false,
            message: 'Credenciales inválidas'
        });
        }

        // 2) Verificar password
        const isValidPassword = await AuthUtils.comparePassword(password, user.password_hash);
        console.log('Password válido:', isValidPassword);

        if (!isValidPassword) {
        return res.status(401).json({
            success: false,
            message: 'Credenciales inválidas'
        });
        }

        // 3) Obtener rol desde institution_users + roles
        const role = await AuthController.getRole(user.id!);

        // 4) Generar token con rol
        const token = AuthUtils.generateToken(user.id!, user.email, role);

        // 5) Responder en formato plano esperado por el frontend
        return res.json({
        success: true,
        token,
        user: {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            role
        }
        });
    } catch (error: any) {
        console.error('❌ Error en login:', error);
        return res.status(500).json({
        success: false,
        message: error?.message || 'Error en el servidor'
        });
    }
    }

    // =========================
    // Refresh token
    // =========================
    static async refreshToken(req: Request, res: Response) {
    console.log('🔄 Refresh token attempt');
    console.log('Headers:', req.headers);

    try {
        // 1) Obtener Bearer token
        const authHeader = req.headers.authorization;
        if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: 'Token de refresco requerido en header Authorization'
        });
        }
        if (!authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'Formato de token inválido. Use: Bearer TOKEN'
        });
        }
        const oldToken = authHeader.substring(7);

        // 2) Decodificar token
        const decoded: any = AuthUtils.decodeToken(oldToken);
        if (!decoded || (!decoded.userId && !decoded.id)) {
        return res.status(401).json({
            success: false,
            message: 'Token inválido'
        });
        }
        const userId = decoded.userId ?? decoded.id;

        // 3) Buscar usuario
        const user = await UserModel.findById(userId);
        if (!user) {
        return res.status(401).json({
            success: false,
            message: 'Usuario no encontrado'
        });
        }

        // 4) Obtener rol actual desde BD (o usar decoded.role si confías en él)
        const role = await AuthController.getRole(user.id!);

        // 5) Generar NUEVO token
        const newToken = AuthUtils.generateToken(user.id!, user.email, role);
        console.log('✅ Token refrescado exitosamente para usuario:', user.email);

        // 6) Responder en el mismo formato que login
        return res.json({
        success: true,
        token: newToken,
        user: {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            role
        }
        });
    } catch (error: any) {
        console.error('❌ Error en refreshToken:', error);
        return res.status(500).json({
        success: false,
        message: 'Error al refrescar el token'
        });
    }
    }

    // =========================
    // Verificar token
    // =========================
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
        const decoded: any = AuthUtils.decodeToken(token);

        if (!decoded || (!decoded.userId && !decoded.id)) {
        return res.status(401).json({
            success: false,
            message: 'Token inválido'
        });
        }
        const userId = decoded.userId ?? decoded.id;

        // Verificar si el usuario aún existe
        const user = await UserModel.findById(userId);
        if (!user) {
        return res.status(401).json({
            success: false,
            message: 'Usuario no encontrado'
        });
        }

        // Usar rol del token si viene, si no obtenerlo desde la BD
        const role = decoded?.role ?? (await AuthController.getRole(user.id!));

        // Respuesta plana
        return res.json({
        success: true,
        user: {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            role: decoded?.role ?? (await AuthController.getRole(user.id!))
        }
});
    } catch (error: any) {
        console.error('❌ Error en verifyToken:', error);
        return res.status(500).json({
        success: false,
        message: 'Error al verificar el token'
        });
    }
    }

    // =========================
    // Logout (opcional: cliente lo maneja)
    // =========================
    static async logout(_req: Request, res: Response) {
    try {
        return res.json({
        success: true,
        message: 'Logout exitoso'
        });
    } catch (error: any) {
        console.error('❌ Error en logout:', error);
        return res.status(500).json({
        success: false,
        message: 'Error en logout'
        });
    }
    }
    }
