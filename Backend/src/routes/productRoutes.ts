import { Router } from 'express';
import { createProduct, getProductById, listProducts } from '../controllers/productController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

/**
 * Public: list products
 */
router.get('/products', listProducts);

/**
 * Public: get product
 */
router.get('/products/:id', getProductById);

/**
 * Admin/Provider admin: create product
 */
router.post('/admin/products', authenticateToken, requireRole(['provider_admin', 'admin']), createProduct);

export default router;
