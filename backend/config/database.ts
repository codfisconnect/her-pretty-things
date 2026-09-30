import dotenv from 'dotenv';
dotenv.config();

export const dbConfig = {
  url: process.env.DATABASE_URL || 'file:./dev.db',
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  jwtSecret: process.env.JWT_SECRET || 'yusraa-hijab-secret-key-2026',
};

export const connectDB = async () => {
  try {
    console.log(`[Database] Connecting in ${dbConfig.nodeEnv} mode...`);
    // Database connection initialization
    return true;
  } catch (error) {
    console.error('[Database] Connection failed:', error);
    return false;
  }
};
