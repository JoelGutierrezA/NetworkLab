import bcrypt from 'bcrypt';
import { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest, hasMessage, JwtPayload } from '../types';

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
    static decodeToken(token: string): JwtPayload | null {
        try {
            const decoded = jwt.decode(token);
            // Verificar que el decoded tiene la estructura esperada
            if (decoded && typeof decoded === 'object' && 'userId' in decoded) {
                return decoded as JwtPayload;
            }
            return null;
        } catch (error) {
            console.error('Error decodificando token:', error);
            return null;
        }
    }

    /* Verifica un token JWT (con firma y expiración) */
    static verifyToken(token: string): JwtPayload {
        try {
            const secret = process.env.JWT_SECRET;
            if (!secret) {
                throw new Error('JWT_SECRET no está definido en las variables de entorno');
            }
            return jwt.verify(token, secret) as JwtPayload;
        } catch (error) {
            console.error('Error verificando token:', error);
            // Re-lanzamos para que los middlewares que llamen puedan decidir cómo responder
            throw error;
        }
    }
}

// MIDDLEWARES
export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ success: false, message: 'Token de acceso requerido' });
    }

    try {
        const decoded = AuthUtils.verifyToken(token);
        req.user = decoded;
        next();
    } catch (error: unknown) {
        const errorMessage = hasMessage(error) ? error.message : 'Error desconocido';
        console.error('Token verification failed in middleware:', errorMessage);
        // Si el token expiró, respondemos 401 para que el cliente pueda intentar refrescarlo
        if (error && typeof error === 'object' && 'name' in error && error.name === 'TokenExpiredError') {
            // error.expiredAt puede venir como Date
            const expiredAt = 'expiredAt' in error ? error.expiredAt : undefined;
            return res.status(401).json({ success: false, message: 'Token expirado', expiredAt });
        }

        // Para otros errores de verificación (firma inválida, etc.) devolvemos 401
        return res.status(401).json({ success: false, message: 'Token inválido' });
    }
};

export const requireRole = (roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        const user = req.user;

        if (!user || !roles.includes(user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Permisos insuficientes para esta acción'
            });
        }

        next();
    };
};

export const requireSelfOrAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ success: false, message: 'No autenticado' });
    }

    const paramId = String(req.params.id);
    // Token payload uses 'userId', but sometimes might be 'id' depending on legacy code.
    const currentUserId = user.userId;
    const sameUser = String(currentUserId) === paramId;
    const isAdmin = user.role === 'admin';

    console.log(`[AuthMiddleware] Checking permission: UserID=${currentUserId}, ParamID=${paramId}, Role=${user.role}`);

    if (!sameUser && !isAdmin) {
        return res.status(403).json({ success: false, message: 'No autorizado' });
    }

    next();
};