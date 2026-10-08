import './config/env.js'
import cors from 'cors'
import express from 'express'
import { errorHandler } from './middleware/errorHandler.js'
import productRoutes from './routes/productRoutes.js'
import cartRoutes from './routes/cartRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import paymentRoutes from './routes/paymentRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import scoopRoutes from './routes/scoopRoutes.js'
import authRoutes from './routes/authRoutes.js'
import wishlistRoutes from './routes/wishlistRoutes.js'
import seasonalGreetingRoutes from './routes/seasonalGreetingRoutes.js'
import gameRoutes from './routes/gameRoutes.js'
import byobRoutes from './routes/byobRoutes.js'
import businessRoutes from './routes/businessRoutes.js'
import instagramRoutes from './routes/instagramRoutes.js'
import { isDatabaseConnected } from './config/database.js'
import pincodeRoutes from './routes/pincodeRoutes.js'

const app = express()
const port = Number(process.env.PORT ?? 4000)

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  'https://her-pretty-things.vercel.app',
].filter(Boolean) as string[]

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin) return callback(null, true)
      if (
        allowedOrigins.includes(origin) ||
        origin.includes('localhost') ||
        origin.includes('127.0.0.1') ||
        origin.endsWith('.vercel.app')
      ) {
        return callback(null, true)
      }
      return callback(null, true) // Permissive in dev for convenience
    },
    credentials: true,
  }),
)

app.use('/api/payments/webhook', express.raw({ type: 'application/json', limit: '1mb' }))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

app.get('/api/health', async (_request, response) => {
  const dbOk = await isDatabaseConnected()
  if (!dbOk) {
    response.status(503).json({
      success: false,
      api: 'ok',
      database: 'unavailable',
    })
    return
  }

  response.json({
    success: true,
    api: 'ok',
    database: 'connected',
  })
})

app.use('/api/products', productRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/scoop', scoopRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/wishlist', wishlistRoutes)
app.use('/api/seasonal-greeting', seasonalGreetingRoutes)
app.use('/api/game', gameRoutes)
app.use('/api/byob', byobRoutes)
app.use('/api/business', businessRoutes)
app.use('/api/instagram', instagramRoutes)
app.use('/api/pincode', pincodeRoutes)

app.use(errorHandler)

app.listen(port, () => {
  console.log(`Her Pretty Things API listening on http://localhost:${port}`)
})
