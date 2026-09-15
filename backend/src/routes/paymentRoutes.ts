import { Router } from 'express'
import {
  cancelPayment,
  createPayment,
  verifyPayment,
  handleWebhook,
} from '../controllers/paymentController.js'

const paymentRoutes = Router()

paymentRoutes.post('/create', createPayment)
paymentRoutes.post('/verify', verifyPayment)
paymentRoutes.post('/cancel', cancelPayment)
paymentRoutes.post('/webhook', handleWebhook)

export default paymentRoutes