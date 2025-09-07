import { Router } from 'express';
import { EquipmentController } from '../controllers/equipmentController';

const router = Router();

// Rutas para equipos
router.post('/equipment', EquipmentController.createEquipment);
router.get('/equipment', EquipmentController.getAllEquipment);
router.get('/equipment/:id', EquipmentController.getEquipmentById);
router.put('/equipment/:id', EquipmentController.updateEquipment);
router.delete('/equipment/:id', EquipmentController.deleteEquipment);
router.get('/laboratories/:labId/equipment', EquipmentController.getEquipmentByLab);

export default router;