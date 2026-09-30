import { Router } from 'express';
import { productController } from '../controllers/productController';
import { validateProductPayload } from '../middleware/validationMiddleware';
import { authMiddleware, requireAdmin } from '../middleware/authMiddleware';

const router = Router();

router.get('/', productController.getAll);
router.get('/categories', productController.getCategories);
router.get('/:id', productController.getById);
router.get('/slug/:slug', productController.getBySlug);
router.post('/', authMiddleware, requireAdmin, validateProductPayload, productController.create);

export default router;
