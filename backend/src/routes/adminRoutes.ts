import { Router } from 'express'
import multer from 'multer'
import {
  getAdminScoopConfigController,
  updateAdminScoopSettingController,
  updateAdminScoopOptionController,
  createAdminScoopOptionController,
  deleteAdminScoopOptionController,
} from '../controllers/adminScoopController.js'
import {
  adminLogin,
  adminLogout,
  adminSession,
  dashboard,
  orders,
  orderDetails,
  orderStatus,
  createAdminProduct,
  updateAdminProduct,
  adminProductDetails,
  deactivateAdminProduct,
  uploadAdminScoopImage,
  deleteAdminProductImage,
  getGreetingsAdmin,
  createGreetingAdmin,
  updateGreetingAdmin,
  deleteGreetingAdmin,
  getByobSettingsAdmin,
  updateByobSettingsAdmin,
  getRewardsAdmin,
  getDamageClaimsAdmin,
  updateDamageClaimAdmin,
  getBusinessInfoAdmin,
  updateBusinessInfoAdmin,
} from '../controllers/adminController.js'

import { requireAdmin } from '../middleware/adminAuth.js'
import { HttpError } from '../middleware/errorHandler.js'
import { uploadProductImage } from '../services/cloudinaryService.js'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
})

const adminRoutes = Router()

// Authentication & Session
adminRoutes.post('/login', adminLogin)
adminRoutes.post('/logout', requireAdmin, adminLogout)
adminRoutes.get('/session', adminSession)
adminRoutes.get('/dashboard', requireAdmin, dashboard)

// Products
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

    response.json({
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

adminRoutes.get('/products/:productId', requireAdmin, adminProductDetails)

adminRoutes.put(
  '/products/:productId',
  requireAdmin,
  upload.array('image', 10),
  updateAdminProduct,
)

adminRoutes.delete(
  '/products/:productId/images/:imageId',
  requireAdmin,
  deleteAdminProductImage,
)

adminRoutes.delete(
  '/products/:productId',
  requireAdmin,
  deactivateAdminProduct,
)

// Orders
adminRoutes.get('/orders', requireAdmin, orders)
adminRoutes.get('/orders/:orderId', requireAdmin, orderDetails)
adminRoutes.put('/orders/:orderId/status', requireAdmin, orderStatus)

// Scoops Management
adminRoutes.get('/scoop/config', requireAdmin, getAdminScoopConfigController)
adminRoutes.put('/scoop/config', requireAdmin, updateAdminScoopSettingController)
adminRoutes.put('/scoop/options/:type/:id', requireAdmin, updateAdminScoopOptionController)
adminRoutes.post('/scoop/options', requireAdmin, createAdminScoopOptionController)
adminRoutes.delete('/scoop/options/:type/:id', requireAdmin, deleteAdminScoopOptionController)
adminRoutes.post('/scoop/image', requireAdmin, upload.single('image'), uploadAdminScoopImage)

// Seasonal Character Greetings
adminRoutes.get('/seasonal-greetings', requireAdmin, getGreetingsAdmin)
adminRoutes.post('/seasonal-greetings', requireAdmin, upload.single('characterImage'), createGreetingAdmin)
adminRoutes.put('/seasonal-greetings/:id', requireAdmin, upload.single('characterImage'), updateGreetingAdmin)
adminRoutes.delete('/seasonal-greetings/:id', requireAdmin, deleteGreetingAdmin)

// BYOB Settings
adminRoutes.get('/byob/settings', requireAdmin, getByobSettingsAdmin)
adminRoutes.put('/byob/settings', requireAdmin, updateByobSettingsAdmin)

// Pretty Play Rewards
adminRoutes.get('/rewards', requireAdmin, getRewardsAdmin)

// Transit Damage Claims
adminRoutes.get('/claims', requireAdmin, getDamageClaimsAdmin)
adminRoutes.put('/claims/:id/status', requireAdmin, updateDamageClaimAdmin)

// Business Information
adminRoutes.get('/business', requireAdmin, getBusinessInfoAdmin)
adminRoutes.put('/business', requireAdmin, updateBusinessInfoAdmin)

export default adminRoutes
