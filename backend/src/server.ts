import scoopRoutes from './routes/scoopRoutes.js'
import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import { errorHandler } from './middleware/errorHandler.js'
import cartRoutes from './routes/cartRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import paymentRoutes from './routes/paymentRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import productRoutes from './routes/productRoutes.js'

const app = express()
const port = Number(process.env.PORT ?? 4000)

app.use(cors({ origin: process.env.FRONTEND_URL ?? 'https://her-pretty-things.vercel.app', credentials: true }))
app.use('/api/payments/webhook', express.raw({ type: 'application/json', limit: '1mb' }))
app.use(express.json({ limit: '1mb' }))

app.get('/api/health', (_request, response) => {
	response.json({ success: true, message: 'Her Pretty Things API is running' })
})

app.use('/api/products', productRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/scoop', scoopRoutes)
app.use(errorHandler)

app.listen(port, () => {
	console.log(`Her Pretty Things API listening on http://localhost:${port}`)
})
