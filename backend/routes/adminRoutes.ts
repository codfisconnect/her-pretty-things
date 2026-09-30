import { Router } from 'express';
import { adminController } from '../controllers/adminController';
import { authMiddleware, requireAdmin } from '../middleware/authMiddleware';

const router = Router();

// Admin routes - secured with admin check
router.get('/stats', authMiddleware, requireAdmin, adminController.getStats);
router.patch('/orders/:id/status', authMiddleware, requireAdmin, adminController.updateOrderStatus);
router.put('/products/:id', authMiddleware, requireAdmin, adminController.updateProduct);
router.delete('/products/:id', authMiddleware, requireAdmin, adminController.deleteProduct);

export default router;
