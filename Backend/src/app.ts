import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { testConnection } from './config/database';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api', authRoutes);
app.use('/api', userRoutes);

// Rutas
app.use('/api', userRoutes); // ← Usar rutas
console.log('🔄 Rutas cargadas:');
console.log('- POST /api/users');
console.log('- GET /api/users/:id'); 
console.log('- GET /api/users');

// Rutas básicas
app.get('/api/health', (req: any, res: any) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Test database connection endpoint
app.get('/api/test-db', async (req: any, res: any) => {
  try {
    const connected = await testConnection();
    if (connected) {
      res.json({ status: 'OK', message: 'Database connected successfully' });
    } else {
      res.status(500).json({ status: 'ERROR', message: 'Database connection failed' });
    }
  } catch (error: any) {
    res.status(500).json({ status: 'ERROR', message: error.message });
  }
});

// Iniciar servidor
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Testing database connection...`);
  
  const connected = await testConnection();
  if (connected) {
    console.log('✅ Database connected successfully');
  } else {
    console.log('❌ Database connection failed');
  }
});