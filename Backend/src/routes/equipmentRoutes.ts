import { Router } from 'express';
import { EquipmentController } from '../controllers/equipmentController';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Equipment
 *     description: Endpoints para gestionar equipos (servicios en frontend)
 * components:
 *   schemas:
 *     Equipment:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         description:
 *           type: string
 *           nullable: true
 *         laboratory_id:
 *           type: integer
 *         model:
 *           type: string
 *           nullable: true
 *         manufacturer:
 *           type: string
 *           nullable: true
 *         requires_training:
 *           type: boolean
 *           nullable: true
 *         status:
 *           type: string
 *           description: Estado del equipo (available, in_use, maintenance, out_of_service)
 *           nullable: true
 *         created_at:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         updated_at:
 *           type: string
 *           format: date-time
 *           nullable: true
 *     ApiResponseEquipmentList:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Equipment'
 *     ApiResponseEquipmentItem:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           $ref: '#/components/schemas/Equipment'
 *     ApiResponseMessage:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 */

// Rutas para equipos
/**
 * @swagger
 * /api/equipment:
 *   get:
 *     summary: Listar todos los equipos
 *     tags: [Equipment]
 *     security: []
 *     responses:
 *       200:
 *         description: Lista de equipos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseEquipmentList'
 */
router.post('/equipment', EquipmentController.createEquipment);
router.get('/equipment', EquipmentController.getAllEquipment);
/**
 * @swagger
 * /api/equipment/{id}:
 *   get:
 *     summary: Obtener un equipo por ID
 *     tags: [Equipment]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Equipo encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseEquipmentItem'
 *       404:
 *         description: Equipo no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseMessage'
 */
router.get('/equipment/:id', EquipmentController.getEquipmentById);
/**
 * @swagger
 * /api/equipment:
 *   post:
 *     summary: Crear un nuevo equipo
 *     tags: [Equipment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Equipment'
 *     responses:
 *       201:
 *         description: Equipo creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseEquipmentItem'
 */
router.put('/equipment/:id', EquipmentController.updateEquipment);
/**
 * @swagger
 * /api/equipment/{id}:
 *   put:
 *     summary: Actualizar un equipo por ID
 *     tags: [Equipment]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Equipment'
 *     responses:
 *       200:
 *         description: Equipo actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseMessage'
 *       404:
 *         description: Equipo no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseMessage'
 */
router.delete('/equipment/:id', EquipmentController.deleteEquipment);
/**
 * @swagger
 * /api/equipment/{id}:
 *   delete:
 *     summary: Eliminar un equipo por ID
 *     tags: [Equipment]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Equipo eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseMessage'
 *       404:
 *         description: Equipo no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseMessage'
 */
router.get('/laboratories/:labId/equipment', EquipmentController.getEquipmentByLab);
/**
 * @swagger
 * /api/laboratories/{labId}/equipment:
 *   get:
 *     summary: Listar equipos por laboratorio
 *     tags: [Equipment]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: labId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de equipos del laboratorio
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseEquipmentList'
 */

export default router;