import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { ServerConfig, connectDB } from './config/index.js';
import apiRoutes from './routes/index.js';
import { errorHandler } from './middlewares/error-middleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const app = express();

// Middlewares
const allowedOrigin = ServerConfig.CORS_ORIGIN === '*' ? true : ServerConfig.CORS_ORIGIN;
app.use(cors({ origin: allowedOrigin, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets from public (logo, favicon, cms assets)
app.use(express.static(path.join(rootDir, 'public')));

// HTTP Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Immediate Health Check (Never blocked by database or external services)
app.get(['/api/health', '/health'], (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'Monumental Energy Backend & CMS API',
    brand: 'Monumental Energy Corp. (TSX-V: MNRG)',
    environment: process.env.VERCEL ? 'vercel-serverless' : 'node-server',
    timestamp: new Date().toISOString()
  });
});

// CMS Portal routes (Immediate page load with zero database latency)
app.get(['/', '/admin', '/admin/*'], (req, res) => {
  const indexPath = path.join(rootDir, 'public', 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  return res.status(200).send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Monumental Energy API</title>
      <style>
        body { background:#0B1F2A; color:#F5F6F1; font-family:system-ui,-apple-system,sans-serif; display:flex; align-items:center; justify-content:center; min-height:100vh; margin:0; }
        .card { background:#16232B; padding:40px; border-radius:20px; border:1px solid #1F6F78; max-width:480px; text-align:center; box-shadow:0 10px 40px rgba(0,0,0,0.4); }
        h1 { color:#B7E34A; margin-top:0; font-size:24px; }
        p { color:#94A3B8; font-size:14px; line-height:1.6; }
        .links { margin-top:24px; display:flex; flex-direction:column; gap:12px; }
        a { color:#0B1F2A; background:#B7E34A; padding:10px 20px; border-radius:12px; text-decoration:none; font-weight:700; font-size:13px; }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>Monumental Energy API</h1>
        <p>Production REST API &amp; Serverless Microservice is active.</p>
        <div class="links">
          <a href="/api/health">Check API Health &rarr;</a>
          <a href="/api/v1/news">View Published News &rarr;</a>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Auto-connect to database before executing API queries
app.use(async (req, res, next) => {
  try {
    await connectDB();
  } catch (err) {
    console.warn('[DB Error]', err.message);
  }
  next();
});

// API Routes
app.use('/api', apiRoutes);
app.use('/', apiRoutes);

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

// Resilient Local Server Startup with Automatic Port Fallback (only in non-Vercel environments)
function startServer(port, retries = 5) {
  const currentPort = Number(port);
  const server = app.listen(currentPort, () => {
    console.log(`====================================================`);
    console.log(`🚀 Monumental Energy Backend & CMS Portal is running!`);
    console.log(`🌐 CMS Portal:   http://localhost:${currentPort}/`);
    console.log(`⚡ API Health:   http://localhost:${currentPort}/api/health`);
    console.log(`📡 API Base:     http://localhost:${currentPort}/api/v1`);
    console.log(`====================================================`);
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

if (!process.env.VERCEL) {
  startServer(ServerConfig.PORT);
}

export default app;
