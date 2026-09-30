import { Router } from 'express';
import { orderController } from '../controllers/orderController';
import { validateOrderPayload } from '../middleware/validationMiddleware';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.post('/', authMiddleware, validateOrderPayload, orderController.create);
router.get('/', authMiddleware, orderController.getAll);
router.get('/:id', orderController.getById);

export default router;
