import { pool } from '../config/database';

export interface Equipment {
    id?: number;
    name: string;
    description?: string;
    laboratory_id: number;
    model?: string;
    manufacturer?: string;
    requires_training?: boolean;
    status?: string;
    created_at?: Date;
    updated_at?: Date;
}

    export class EquipmentModel {
    // Crear nuevo equipo
    static async create(equipment: Equipment): Promise<Equipment> {
        const query = `
            INSERT INTO equipment (name, description, laboratory_id, model, manufacturer, requires_training, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            equipment.name,
            equipment.description || null,
            equipment.laboratory_id,
            equipment.model || null,
            equipment.manufacturer || null,
            equipment.requires_training || false,
            equipment.status || 'available'
        ];
        const [result]: any = await pool.execute(query, values);
        return { ...equipment, id: result.insertId };
    }

    // Obtener todos los equipos
    static async findAll(): Promise<Equipment[]> {
    const query = `
        SELECT e.*, l.name as laboratory_name 
        FROM equipment e 
        LEFT JOIN laboratories l ON e.laboratory_id = l.id
    `;
    const [rows]: any = await pool.execute(query);
    return rows;
    }

    // Obtener equipo por ID
    static async findById(id: number): Promise<Equipment | null> {
    const query = `
        SELECT e.*, l.name as laboratory_name 
        FROM equipment e 
        LEFT JOIN laboratories l ON e.laboratory_id = l.id 
        WHERE e.id = ?
    `;
    const [rows]: any = await pool.execute(query, [id]);
    return rows.length > 0 ? rows[0] : null;
    }

    // Actualizar equipo
    static async update(id: number, updates: Partial<Equipment>): Promise<boolean> {
        const allowedFields = ['name', 'description', 'laboratory_id', 'model', 'manufacturer', 'requires_training', 'status'];
        const fields = Object.keys(updates).filter(f => allowedFields.includes(f));
        if (fields.length === 0) return false;
        const setClause = fields.map(field => `${field} = ?`).join(', ');
        const values = fields.map(field => (updates as any)[field]);
        values.push(id);
        const query = `UPDATE equipment SET ${setClause} WHERE id = ?`;
        const [result]: any = await pool.execute(query, values);
        return result.affectedRows > 0;
    }

    // Eliminar equipo
    static async delete(id: number): Promise<boolean> {
    const query = 'DELETE FROM equipment WHERE id = ?';
    const [result]: any = await pool.execute(query, [id]);
    return result.affectedRows > 0;
    }

    // Obtener equipos por laboratorio
    static async findByLaboratory(labId: number): Promise<Equipment[]> {
    const query = 'SELECT * FROM equipment WHERE laboratory_id = ?';
    const [rows]: any = await pool.execute(query, [labId]);
    return rows;
    }

    // Métodos para servicios (realmente son equipos)
    static async findServicesByLaboratory(labId: number): Promise<Equipment[]> {
        const query = `SELECT * FROM equipment WHERE laboratory_id = ?`;
        const [rows]: any = await pool.execute(query, [labId]);
        return rows;
    }

    static async findServicesAll(): Promise<Equipment[]> {
        const query = `SELECT e.*, l.name as laboratory_name FROM equipment e LEFT JOIN laboratories l ON e.laboratory_id = l.id`;
        const [rows]: any = await pool.execute(query);
        return rows;
    }

    static async findServiceById(id: number): Promise<Equipment | null> {
        const query = `SELECT e.*, l.name as laboratory_name FROM equipment e LEFT JOIN laboratories l ON e.laboratory_id = l.id WHERE e.id = ?`;
        const [rows]: any = await pool.execute(query, [id]);
        return rows.length > 0 ? rows[0] : null;
    }
}