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
    return jwt.sign(
        { userId, email, role },
        process.env.JWT_SECRET!,
        { expiresIn: '1h' }
    );
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
        return jwt.verify(token, process.env.JWT_SECRET!);
    } catch (error) {
        console.error('Error verificando token:', error);
        return null;
    }
    }
    }

    // MIDDLEWARES
    export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
    return res.status(401).json({ success: false, message: 'Token de acceso requerido' });
    }

    try {
    const decoded = AuthUtils.verifyToken(token);
    (req as any).user = decoded;
    next();
    } catch (error) {
    return res.status(403).json({ success: false, message: 'Token inválido o expirado' });
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