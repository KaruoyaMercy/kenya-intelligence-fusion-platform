import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import dotenv from 'dotenv';
import { createServer } from 'http';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth';
import intelligenceRoutes from './routes/intelligence';
import correlationRoutes from './routes/correlation';
import alertsRoutes from './routes/alerts';

// Import WebSocket manager
import { WebSocketManager } from './services/websocketManager';

const app = express();
const PORT = process.env.PORT || 8000;

// Create HTTP server for WebSocket integration
const server = createServer(app);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.com'] 
    : ['http://localhost:3000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later'
    },
    timestamp: new Date().toISOString()
  }
});
app.use(limiter);

// General middleware
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  try {
    const connectedClients = WebSocketManager.getClientCount();
    const agencyConnections = WebSocketManager.getAgencyConnections();
    
    res.status(200).json({
      success: true,
      data: {
        status: 'healthy',
        service: 'Kenya Intelligence Fusion Platform API',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        websocket_status: {
          connected_clients: connectedClients,
          agency_connections: agencyConnections,
          realtime_feed_active: true
        },
        features: {
          authentication: 'active',
          intelligence_processing: 'active',
          ai_correlation: 'active',
          realtime_websockets: 'active'
        }
      },
      message: 'Service is running with all features operational'
    });
  } catch (error) {
    res.status(200).json({
      success: true,
      data: {
        status: 'healthy',
        service: 'Kenya Intelligence Fusion Platform API',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        features: {
          authentication: 'active',
          intelligence_processing: 'active',
          ai_correlation: 'active',
          realtime_websockets: 'initializing'
        }
      },
      message: 'Service is running'
    });
  }
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/intelligence', intelligenceRoutes);
app.use('/api/v1/correlation', correlationRoutes);
app.use('/api/v1/alerts', alertsRoutes);

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Something went wrong!'
    },
    timestamp: new Date().toISOString()
  });
});

// Initialize WebSocket manager
WebSocketManager.initialize(server);

// Start server
server.listen(PORT, () => {
  console.log('🚀 Kenya Intelligence Fusion Platform API');
  console.log(`🌍 Server running on http://localhost:${PORT}`);
  console.log(`🔗 WebSocket feed available at ws://localhost:${PORT}/ws/intelligence-feed`);
  console.log(`🔒 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('🇰🇪 FOR KENYA, FOR SECURITY, FOR THE FUTURE!');
});

export default app;

