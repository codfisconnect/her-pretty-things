import { Router } from 'express'
import { cancelExistingOrder, newOrder, readOrder, readUserOrders } from '../controllers/orderController.js'

const orderRoutes = Router()

orderRoutes.post('/', newOrder)
orderRoutes.get('/user/:userId', readUserOrders)
orderRoutes.post('/:orderId/cancel', cancelExistingOrder)
orderRoutes.get('/:orderId', readOrder)

export default orderRoutes
