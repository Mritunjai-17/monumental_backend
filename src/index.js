import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { ServerConfig, connectDB } from './config/index.js';
import apiRoutes from './routes/index.js';
import { errorHandler } from './middlewares/error-middleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const app = express();

// Middlewares
app.use(cors({ origin: ServerConfig.CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets from public (logo, favicon, cms assets)
app.use(express.static(path.join(rootDir, 'public')));

// HTTP Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'Monumental Energy Backend & CMS API',
    brand: 'Monumental Energy Corp. (TSX-V: MNRG)',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api', apiRoutes);

// CMS Portal routes
app.get(['/', '/admin', '/admin/*'], (req, res) => {
  res.sendFile(path.join(rootDir, 'public', 'index.html'));
});

// 404 Catch-all Handler for non-existing API routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    error: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Global Error Handler
app.use(errorHandler);

// Resilient Server Startup with Automatic Port Fallback
function startServer(port, retries = 5) {
  const currentPort = Number(port);
  const server = app.listen(currentPort, () => {
    console.log(`====================================================`);
    console.log(`🚀 Monumental Energy Backend & CMS Portal is running!`);
    console.log(`🌐 CMS Portal:   http://localhost:${currentPort}/`);
    console.log(`⚡ API Health:   http://localhost:${currentPort}/api/health`);
    console.log(`📡 API Base:     http://localhost:${currentPort}/api/v1`);
    console.log(`====================================================`);
    
    // Connect to DB in background
    connectDB().catch(() => {});
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE' && retries > 0) {
      console.warn(`[Server] Port ${currentPort} is busy. Trying port ${currentPort + 1}...`);
      startServer(currentPort + 1, retries - 1);
    } else {
      console.error('[Server Error]', err);
    }
  });

  return server;
}

startServer(ServerConfig.PORT);

export default app;
