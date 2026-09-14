import { Router } from 'express'
import {
  adminLogin,
  adminLogout,
  adminSession,
  dashboard,
  orderDetails,
  orders,
  orderStatus,
  createAdminProduct,
} from '../controllers/adminController.js'
import { requireAdmin } from '../middleware/adminAuth.js'

const adminRoutes = Router()
adminRoutes.post('/login', adminLogin)
adminRoutes.post('/products', requireAdmin, createAdminProduct)
adminRoutes.post('/logout', requireAdmin, adminLogout)
adminRoutes.get('/session', adminSession)
adminRoutes.get('/dashboard', requireAdmin, dashboard)
adminRoutes.get('/orders', requireAdmin, orders)
adminRoutes.get('/orders/:orderId', requireAdmin, orderDetails)
adminRoutes.put('/orders/:orderId/status', requireAdmin, orderStatus)

export default adminRoutes
