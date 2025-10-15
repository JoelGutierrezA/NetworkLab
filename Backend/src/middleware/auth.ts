import bcrypt from 'bcrypt';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

// CLASE AuthUtils
export class AuthUtils {
    /* Hashea una contraseña */
    static async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
    }

    /* Compara una contraseña con un hash */
    static async comparePassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
    }

    /* Genera un token JWT */
    static generateToken(userId: number, email: string, role: string): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET no está definido en las variables de entorno');
    }

    return jwt.sign({ userId, email, role }, secret, { expiresIn: '1h' });
    }

    /* Decodifica un token JWT sin verificar la firma */
    static decodeToken(token: string): any {
    try {
        return jwt.decode(token);
    } catch (error) {
        console.error('Error decodificando token:', error);
        return null;
    }
    }

    /* Verifica un token JWT (con firma y expiración) */
    static verifyToken(token: string): any {
    try {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
        throw new Error('JWT_SECRET no está definido en las variables de entorno');
        }
        return jwt.verify(token, secret);
    } catch (error) {
        console.error('Error verificando token:', error);
        // Re-lanzamos para que los middlewares que llamen puedan decidir cómo responder
        throw error;
    }
    }
    }

    // MIDDLEWARES
    export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1]; // Bearer TOKEN

    if (!token) {
    return res.status(401).json({ success: false, message: 'Token de acceso requerido' });
    }

    try {
    const decoded = AuthUtils.verifyToken(token);
    (req as any).user = decoded;
    next();
    } catch (error: any) {
        console.error('Token verification failed in middleware:', error?.message ?? error);
        // Si el token expiró, respondemos 401 para que el cliente pueda intentar refrescarlo
        if (error && error.name === 'TokenExpiredError') {
        // error.expiredAt puede venir como Date
        return res.status(401).json({ success: false, message: 'Token expirado', expiredAt: error.expiredAt });
        }

        // Para otros errores de verificación (firma inválida, etc.) devolvemos 401
        return res.status(401).json({ success: false, message: 'Token inválido' });
    }
    };

    export const requireRole = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user || !roles.includes(user.role)) {
        return res.status(403).json({
        success: false,
        message: 'Permisos insuficientes para esta acción'
        });
    }

    next();
    };
};

export const requireSelfOrAdmin = (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) {
        return res.status(401).json({ success: false, message: 'No autenticado' });
    }

    const paramId = String(req.params.id);
    const sameUser = String(user.id) === paramId;
    const isAdmin = user.role === 'admin';

    if (!sameUser && !isAdmin) {
        return res.status(403).json({ success: false, message: 'No autorizado' });
    }

    next();
};