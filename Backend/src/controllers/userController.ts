import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
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
        "INSERT INTO users (email, password_hash, first_name, last_name) VALUES (?, ?, ?, ?)",
        [email, hashedPassword, first_name, last_name]
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
    const page = parseInt((req.query.page as string) ?? '0') || 0;       // página actual (0-based)
    const pageSize = parseInt((req.query.pageSize as string) ?? '5') || 5; // tamaño de página
    const offset = page * pageSize;

    const [rows]: any = await pool.query(
        `SELECT u.id, u.email, u.first_name, u.last_name, u.created_at, 
                COALESCE(r.name, 'student') AS role
        FROM users u
        LEFT JOIN institution_users iu ON iu.user_id = u.id
        LEFT JOIN roles r ON r.id = iu.role_id
        ORDER BY u.id
        LIMIT ? OFFSET ?`,
        [pageSize, offset]
    );


    const [countRows]: any = await pool.query("SELECT COUNT(*) AS count FROM users");

    res.json({
        usuarios: rows,
        total: countRows[0].count
    });
    } catch (error) {
    console.error("❌ Error obteniendo usuarios:", error);
    res.status(500).json({ success: false, message: "Error obteniendo usuarios" });
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

    res.json(rows[0]);
    } catch (error) {
    console.error("❌ Error obteniendo usuario:", error);
    res.status(500).json({ success: false, message: "Error obteniendo usuario" });
    }
};

// Login con verificación de rol
export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
    // Buscar usuario y rol asociado
    const [rows]: any = await pool.query(
        `SELECT u.id, u.email, u.password_hash, u.first_name, u.last_name, r.name as role
        FROM users u
        LEFT JOIN institution_users iu ON iu.user_id = u.id
        LEFT JOIN roles r ON r.id = iu.role_id
        WHERE u.email = ?`,
        [email]
    );

    if (!rows.length) {
        return res.status(401).json({ success: false, message: "Usuario no encontrado" });
    }

    const user = rows[0];

    // Verificar contraseña
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
        return res.status(401).json({ success: false, message: "Contraseña incorrecta" });
    }

    // Generar token con rol incluido
    const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET as string,
        { expiresIn: "1h" }
    );

    // Responder con datos del usuario + rol
    return res.json({
        success: true,
        token,
        user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role || "student",
        },
    });
    } catch (error) {
    console.error("❌ Error en login:", error);
    return res.status(500).json({ success: false, message: "Error en el servidor" });
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


