import { Router } from 'express';
import { cartController } from '../controllers/cartController';

const router = Router();

router.get('/', cartController.getCart);
router.post('/sync', cartController.syncCart);
router.delete('/clear', cartController.clearCart);

export default router;
