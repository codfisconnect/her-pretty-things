import { Router } from 'express'
import {
  register,
  login,
  getProfile,
  updateProfile,
  forgotPassword,
  resetPasswordController,
} from '../controllers/authController.js'

const authRoutes = Router()

authRoutes.post('/register', register)
authRoutes.post('/login', login)
authRoutes.get('/profile', getProfile)
authRoutes.put('/profile', updateProfile)
authRoutes.post('/forgot-password', forgotPassword)
authRoutes.post('/reset-password', resetPasswordController)

export default authRoutes
