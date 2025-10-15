import { Router } from 'express';

import { createProviderWithAdmin, createSupplier, deleteSupplier, getSupplierById, listSuppliers, updateSupplier } from '../controllers/providerController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

/**
 * @openapi
 * /suppliers:
 *   get:
 *     tags:
 *       - Suppliers
 *     summary: List all suppliers
 *     responses:
 *       '200':
 *         description: A list of suppliers
 */
router.get('/suppliers', listSuppliers);

/**
 * @openapi
 * /suppliers/{id}:
 *   get:
 *     tags:
 *       - Suppliers
 *     summary: Get supplier by id
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Supplier id
 *     responses:
 *       '200':
 *         description: Supplier object
 *       '404':
 *         description: Not found
 */
router.get('/suppliers/:id', getSupplierById);

// Admin: create supplier (simple) and create with admin
/**
 * @openapi
 * /admin/suppliers:
 *   post:
 *     tags:
 *       - Suppliers
 *     summary: Create supplier and admin user (admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               provider:
 *                 type: object
 *               admin:
 *                 type: object
 *     responses:
 *       '201':
 *         description: Created
 */
router.post('/admin/suppliers', authenticateToken, requireRole(['admin']), createProviderWithAdmin);

/**
 * @openapi
 * /suppliers:
 *   post:
 *     tags:
 *       - Suppliers
 *     summary: Create supplier (admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       '201':
 *         description: Created
 */
router.post('/suppliers', authenticateToken, requireRole(['admin']), createSupplier);

/**
 * @openapi
 * /suppliers/{id}:
 *   put:
 *     tags:
 *       - Suppliers
 *     summary: Update supplier (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       '200':
 *         description: Updated
 */
router.put('/suppliers/:id', authenticateToken, requireRole(['admin']), updateSupplier);

/**
 * @openapi
 * /suppliers/{id}:
 *   delete:
 *     tags:
 *       - Suppliers
 *     summary: Delete supplier (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       '200':
 *         description: Deleted
 */
router.delete('/suppliers/:id', authenticateToken, requireRole(['admin']), deleteSupplier);

export default router;
