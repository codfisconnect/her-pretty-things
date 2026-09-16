import { Router } from 'express'

import upload from '../middleware/upload.js'

import {
  adminLogin,
  adminLogout,
  adminSession,
  dashboard,
  orderDetails,
  orders,
  orderStatus,
  createAdminProduct,
  updateAdminProduct,
  deactivateAdminProduct,
} from '../controllers/adminController.js'

import { requireAdmin } from '../middleware/adminAuth.js'
import { HttpError } from '../middleware/errorHandler.js'
import { uploadProductImage } from '../services/cloudinaryService.js'

const adminRoutes = Router()

adminRoutes.post('/login', adminLogin)

adminRoutes.post(
  '/products',
  requireAdmin,
  upload.array('image', 10),
  createAdminProduct,
)

adminRoutes.post(
  '/products/upload-image',
  requireAdmin,
  upload.single('image'),
  async (request, response) => {
    if (!request.file) {
      throw new HttpError(400, 'Image file is required.')
    }

    const result = await uploadProductImage(
      request.file.buffer,
      request.file.originalname,
    )

    response.status(201).json({
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
      },
    })
  },
)

adminRoutes.put(
  '/products/:productId',
  requireAdmin,
  updateAdminProduct,
)

adminRoutes.delete(
  '/products/:productId',
  requireAdmin,
  deactivateAdminProduct,
)

adminRoutes.post('/logout', requireAdmin, adminLogout)

adminRoutes.get('/session', adminSession)

adminRoutes.get('/dashboard', requireAdmin, dashboard)

adminRoutes.get('/orders', requireAdmin, orders)

adminRoutes.get('/orders/:orderId', requireAdmin, orderDetails)

adminRoutes.put('/orders/:orderId/status', requireAdmin, orderStatus)

export default adminRoutes