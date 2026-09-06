import { Router } from 'express'
import { createOrderController, readOrder } from '../controllers/orderController.js'

const orderRoutes = Router()
orderRoutes.post('/', createOrderController)
orderRoutes.get('/:orderId', readOrder)

export default orderRoutes
