import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { dbConfig, connectDB } from './config/database';
import productRoutes from './routes/productRoutes';
import cartRoutes from './routes/cartRoutes';
import orderRoutes from './routes/orderRoutes';
import adminRoutes from './routes/adminRoutes';
import { errorHandler, notFoundHandler } from './middleware/errorMiddleware';

dotenv.config();

const app = express();
const PORT = dbConfig.port || 5000;

// Enable CORS & JSON parsing
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// API health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    store: 'YUSRAA Luxury Hijabs',
    timestamp: new Date().toISOString()
  });
});

// Modular Routes
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`[YUSRAA API] Server running on http://localhost:${PORT}`);
  });
});

export default app;
