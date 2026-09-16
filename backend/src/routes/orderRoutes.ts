import { Router } from 'express'
import {
  cancelOrderController,
  createOrderController,
  readOrder,
} from '../controllers/orderController.js'

const orderRoutes = Router()
orderRoutes.post('/', createOrderController)
orderRoutes.get('/:orderId', readOrder)

export default orderRoutes
