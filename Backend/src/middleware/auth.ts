import { NextFunction, Request, Response } from 'express';
import { AuthUtils } from '../utils/auth';

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