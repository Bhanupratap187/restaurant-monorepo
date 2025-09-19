import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { connectDatabase } from '@restaurant-monorepo/database';
import { env, isDevelopment } from './config/environment';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import orderRoutes from './routes/orders';
import menuRoutes from './routes/menu';

const app = express();

// Trust proxy (for accurate IP addresses)
app.set('trust proxy', 1);

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: isDevelopment ? false : undefined,
  })
);

// CORS configuration
app.use(
  cors({
    origin: env.CORS_ORIGIN.split(','),
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

// Compression middleware
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging in development
if (isDevelopment) {
  app.use((req, res, next) => {
    logger.debug(`${req.method} ${req.path}`, {
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Restaurant Management API',
    version: '1.0.0',
    environment: env.NODE_ENV,
  });
});

// API Routes
const apiPrefix = env.API_PREFIX;
app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/users`, userRoutes);
app.use(`${apiPrefix}/orders`, orderRoutes);
app.use(`${apiPrefix}/menu`, menuRoutes);

// Welcome route
app.get('/', (req, res) => {
  res.json({
    message: '🍽️ Welcome to Restaurant Management API',
    version: '1.0.0',
    documentation: `${req.protocol}://${req.get('host')}/health`,
    endpoints: {
      auth: `${apiPrefix}/auth`,
      menu: `${apiPrefix}/menu`,
      orders: `${apiPrefix}/orders`,
      users: `${apiPrefix}/users`,
    },
  });
});

// 404 handler
app.use('*', notFoundHandler);

// Global error handler
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Database connection and server startup
async function startServer() {
  try {
    // Connect to database
    await connectDatabase({
      mongoUri: env.MONGODB_URI,
    });

    // Start server
    app.listen(env.PORT, env.HOST, () => {
      logger.info(
        '🚀━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━🚀'
      );
      logger.info(`🍽️   Restaurant Management API Server`);
      logger.info(`📡   Server: http://${env.HOST}:${env.PORT}`);
      logger.info(`🔍   Health: http://${env.HOST}:${env.PORT}/health`);
      logger.info(
        `📚   API Endpoints: http://${env.HOST}:${env.PORT}${apiPrefix}`
      );
      logger.info(`🌟   Environment: ${env.NODE_ENV}`);
      logger.info(`💾   Database: Connected to MongoDB`);
      logger.info(
        '🚀━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━🚀'
      );
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();
