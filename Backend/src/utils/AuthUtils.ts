import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export class AuthUtils {
    // Generar hash de password
    static async hashPassword(password: string): Promise<string> {
        const saltRounds = 10;
        return await bcrypt.hash(password, saltRounds);
    }

    // Comparar password con hash
    static async comparePassword(password: string, hash: string): Promise<boolean> {
        return await bcrypt.compare(password, hash);
    }

    // Generar JWT token
    static generateToken(userId: number, email: string, role: string): string {
        return jwt.sign(
            { userId, email, role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
    }

    // Verificar JWT token
    static verifyToken(token: string): any {
        try {
            return jwt.verify(token, JWT_SECRET);
        } catch (error) {
            throw new Error('Token inválido');
        }
    }

    // ✅ DECODIFICAR token (NUEVO MÉTODO)
    static decodeToken(token: string): any {
        try {
            return jwt.decode(token); // Solo decodifica sin verificar
        } catch (error) {
            console.error('Error decodificando token:', error);
            return null;
        }
    }
}