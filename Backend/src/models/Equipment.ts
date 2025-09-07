import { pool } from '../config/database';

export interface Equipment {
    id?: number;
    name: string;
    description: string;
    laboratory_id: number;
    model?: string;
    manufacturer?: string;
    specifications?: any;
    status: 'available' | 'in_use' | 'maintenance' | 'out_of_service';
    hourly_rate?: number;
    requires_training?: boolean;
    max_reservation_hours?: number;
    created_at?: Date;
    updated_at?: Date;
    }

    export class EquipmentModel {
    // Crear nuevo equipo
    static async create(equipment: Equipment): Promise<Equipment> {
    const query = `
        INSERT INTO equipment (name, description, laboratory_id, model, manufacturer, 
                            specifications, status, hourly_rate, requires_training, max_reservation_hours)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        equipment.name,
        equipment.description,
        equipment.laboratory_id,
        equipment.model || null,
        equipment.manufacturer || null,
        equipment.specifications ? JSON.stringify(equipment.specifications) : null,
        equipment.status,
        equipment.hourly_rate || null,
        equipment.requires_training || false,
        equipment.max_reservation_hours || 24
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
    const fields = Object.keys(updates);
    if (fields.length === 0) return false;

    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = [...Object.values(updates), id];

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
}