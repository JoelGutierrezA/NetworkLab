import { Request, Response } from 'express';
import { Equipment, EquipmentModel } from '../models/Equipment';

export class EquipmentController {
    // Crear nuevo equipo
    static async createEquipment(req: Request, res: Response) {
    try {
        const equipmentData: Equipment = req.body;
        const newEquipment = await EquipmentModel.create(equipmentData);
        
        res.status(201).json({
        success: true,
        message: 'Equipo creado exitosamente',
        data: newEquipment
        });
    } catch (error: any) {
        res.status(500).json({
        success: false,
        message: 'Error al crear equipo: ' + error.message
        });
    }
    }

    // Obtener todos los equipos
    static async getAllEquipment(req: Request, res: Response) {
    try {
        const equipment = await EquipmentModel.findAll();
        
        res.json({
        success: true,
        data: equipment
        });
    } catch (error: any) {
        res.status(500).json({
        success: false,
        message: 'Error al obtener equipos: ' + error.message
        });
    }
    }

    // Obtener equipo por ID
    static async getEquipmentById(req: Request, res: Response) {
    try {
        const id = parseInt(req.params.id);
        const equipment = await EquipmentModel.findById(id);
        
        if (!equipment) {
        return res.status(404).json({
            success: false,
            message: 'Equipo no encontrado'
        });
        }
        
        res.json({
        success: true,
        data: equipment
        });
    } catch (error: any) {
        res.status(500).json({
        success: false,
        message: 'Error al obtener equipo: ' + error.message
        });
    }
    }

    // Actualizar equipo
    static async updateEquipment(req: Request, res: Response) {
    try {
        const id = parseInt(req.params.id);
        const updates: Partial<Equipment> = req.body;
        
        const updated = await EquipmentModel.update(id, updates);
        
        if (!updated) {
        return res.status(404).json({
            success: false,
            message: 'Equipo no encontrado o sin cambios'
        });
        }
        
        res.json({
        success: true,
        message: 'Equipo actualizado exitosamente'
        });
    } catch (error: any) {
        res.status(500).json({
        success: false,
        message: 'Error al actualizar equipo: ' + error.message
        });
    }
    }

    // Eliminar equipo
    static async deleteEquipment(req: Request, res: Response) {
    try {
        const id = parseInt(req.params.id);
        const deleted = await EquipmentModel.delete(id);
        
        if (!deleted) {
        return res.status(404).json({
            success: false,
            message: 'Equipo no encontrado'
        });
        }
        
        res.json({
        success: true,
        message: 'Equipo eliminado exitosamente'
        });
    } catch (error: any) {
        res.status(500).json({
        success: false,
        message: 'Error al eliminar equipo: ' + error.message
        });
    }
    }

    // Obtener equipos por laboratorio
    static async getEquipmentByLab(req: Request, res: Response) {
    try {
        const labId = parseInt(req.params.labId);
        const equipment = await EquipmentModel.findByLaboratory(labId);
        
        res.json({
        success: true,
        data: equipment
        });
    } catch (error: any) {
        res.status(500).json({
        success: false,
        message: 'Error al obtener equipos del laboratorio: ' + error.message
        });
    }
    }
}