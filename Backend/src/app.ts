import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { testConnection } from './config/database';
import authRoutes from './routes/authRoutes';
import equipmentRoutes from './routes/equipmentRoutes';
import institutionRoutes from './routes/institutionRoutes';
import laboratoriesRoutes from './routes/laboratoriesRoutes';
import userRoutes from './routes/userRoutes';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Montar routers en rutas explícitas
app.use('/api', authRoutes);
  app.use('/api', userRoutes);
  app.use('/api', institutionRoutes);
  app.use('/api', laboratoriesRoutes);
  app.use('/api', equipmentRoutes);

// Rutas registradas (resumen)
console.log('🔄 Rutas cargadas:');
console.log('- Auth: POST /api/auth/login');
console.log('- Users: GET /api/users | POST /api/users | GET /api/users/:id');
console.log('- Equipment: CRUD en /api/equipment');
console.log('- Institutions: rutas bajo /api/institutions');
console.log('- Laboratories: rutas bajo /api/laboratories y /api/institutions/:id/laboratories');

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
app.listen(Number(PORT), '0.0.0.0', async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Testing database connection...`);
  
  const connected = await testConnection();
  if (connected) {
    console.log('✅ Database connected successfully');
  } else {
    console.log('❌ Database connection failed');
  }
});

// Swagger setup
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'NetworkLab API',
      version: '1.0.0',
      description: 'Documentación de la API de NetworkLab'
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));