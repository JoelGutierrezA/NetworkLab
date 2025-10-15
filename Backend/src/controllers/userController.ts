import bcrypt from "bcrypt";
import { Request, Response } from "express";
import pool from "../config/database";

// Crear usuario
export const createUser = async (req: Request, res: Response) => {
    try {
    const { email, password, first_name, last_name } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Email y contraseña requeridos" });
    }

    // Hash de contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar usuario
    const [result]: any = await pool.query(
        "INSERT INTO users (email, password_hash, first_name, last_name, created_via) VALUES (?, ?, ?, ?, ?)",
        [email, hashedPassword, first_name, last_name, 'public']
    );

    res.json({ success: true, userId: result.insertId });
    } catch (error) {
    console.error("❌ Error creando usuario:", error);
    res.status(500).json({ success: false, message: "Error creando usuario" });
    }
    };

// Obtener todos los usuarios
export const getUsers = async (req: Request, res: Response) => {
    try {
    const page = parseInt((req.query.page as string) ?? '1');       // página actual (1-based)
    const pageSize = parseInt((req.query.pageSize as string) ?? '10'); // tamaño de página
    const offset = (page - 1) * pageSize;

    // Consulta principal con join a institutions y roles usando organization_users polimórfica
    const [rows]: any = await pool.query(
        `SELECT
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        COALESCE(r.name, 'student') AS role,
        i.name AS institution_name,
        u.created_at
        FROM users u
        LEFT JOIN organization_users ou ON ou.user_id = u.id AND ou.organization_type = 'institution'
        LEFT JOIN roles r ON r.id = ou.role_id
        LEFT JOIN institutions i ON i.id = ou.organization_id
        ORDER BY u.id ASC
        LIMIT ? OFFSET ?`,
        [pageSize, offset]
    );

    // Total de usuarios
    const [countRows]: any = await pool.query('SELECT COUNT(*) AS count FROM users');
    const total = countRows[0].count;

    res.json({
        success: true,
        usuarios: rows,
        total,
    });
    } catch (error) {
    console.error('❌ Error obteniendo usuarios:', error);
    res.status(500).json({
        success: false,
        message: 'Error obteniendo usuarios',
    });
    }
    };

// Obtener usuario por ID
export const getUserById = async (req: Request, res: Response) => {
    try {
    const { id } = req.params;
    const [rows]: any = await pool.query(
        "SELECT id, email, first_name, last_name FROM users WHERE id = ?",
        [id]
    );

    if (!rows.length) {
        return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }

    res.json({ success: true, user: rows[0] });
    } catch (error) {
    console.error("❌ Error obteniendo usuario:", error);
    res.status(500).json({ success: false, message: "Error obteniendo usuario" });
    }
};


// Cambiar contraseña de un usuario
export const updatePassword = async (req: Request, res: Response) => {
    try {
    const { id } = req.params; // id del usuario (desde token o params)
    const { oldPassword, newPassword } = req.body;

    // Buscar usuario
    const [rows]: any = await pool.query("SELECT password_hash FROM users WHERE id = ?", [id]);
    if (!rows.length) {
        return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }

    const user = rows[0];

    // Verificar contraseña actual
    const validPassword = await bcrypt.compare(oldPassword, user.password_hash);
    if (!validPassword) {
        return res.status(401).json({ success: false, message: "Contraseña actual incorrecta" });
    }

    // Encriptar nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar
    await pool.query("UPDATE users SET password_hash = ? WHERE id = ?", [hashedPassword, id]);

    res.json({ success: true, message: "Contraseña actualizada correctamente" });
    } catch (error) {
    console.error("❌ Error cambiando contraseña:", error);
    res.status(500).json({ success: false, message: "Error en el servidor" });
    }
};

// Actualizar campos básicos de un usuario (nombre, apellido, email, bio)
export const updateUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { first_name, last_name, email, bio } = req.body;

        // Verificar existencia
        const [rows]: any = await pool.query('SELECT id FROM users WHERE id = ?', [id]);
        if (!rows.length) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }

        const fields: string[] = [];
        const values: any[] = [];

        if (first_name !== undefined) { fields.push('first_name = ?'); values.push(first_name); }
        if (last_name !== undefined) { fields.push('last_name = ?'); values.push(last_name); }
        if (email !== undefined) { fields.push('email = ?'); values.push(email); }
        if (bio !== undefined) { fields.push('bio = ?'); values.push(bio); }

        if (fields.length === 0) {
            return res.status(400).json({ success: false, message: 'No hay campos para actualizar' });
        }

        values.push(id);
        const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
        await pool.query(sql, values);

        return res.json({ success: true, message: 'Usuario actualizado correctamente' });
    } catch (error) {
        console.error('❌ Error actualizando usuario:', error);
        return res.status(500).json({ success: false, message: 'Error actualizando usuario' });
    }
};

// Actualizar institución de un usuario
export const updateUserInstitution = async (req: Request, res: Response) => {
    const { id } = req.params; // id del usuario
    const { institutionId, roleId } = req.body; // roleId opcional, por defecto student (4)

    try {
    // Limpiar instituciones anteriores (si solo puede tener una)
        // Limpiar membership polimórfico para institution
        await pool.query("DELETE FROM organization_users WHERE user_id = ? AND organization_type = 'institution'", [id]);

    // Insertar nueva relación en organization_users
        await pool.query(
            'INSERT INTO organization_users (user_id, organization_type, organization_id, role_id) VALUES (?, ?, ?, ?)',
            [id, 'institution', institutionId, roleId || 4] // 4 = student
        );

        res.json({ success: true, message: 'Institución actualizada correctamente' });
        } catch (error) {
        console.error('❌ Error actualizando institución:', error);
        res.status(500).json({ success: false, message: 'Error actualizando institución' });
        }
};

// Eliminar usuario (solo admin)
export const deleteUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

    // Verificar si existe
    const [rows]: any = await pool.query("SELECT id FROM users WHERE id = ?", [id]);
        if (!rows.length) {
        return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }

    // Eliminar usuario
    await pool.query("DELETE FROM users WHERE id = ?", [id]);

    return res.json({ success: true, message: "Usuario eliminado correctamente" });
            } catch (error) {
    console.error("❌ Error eliminando usuario:", error);
    return res.status(500).json({ success: false, message: "Error en el servidor" });
    }
};
