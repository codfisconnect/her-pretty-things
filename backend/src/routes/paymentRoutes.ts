import { Router } from 'express'
import { createPayment, verifyPayment } from '../controllers/paymentController.js'

const paymentRoutes = Router()
paymentRoutes.post('/create', createPayment)
paymentRoutes.post('/verify', verifyPayment)

export default paymentRoutes
