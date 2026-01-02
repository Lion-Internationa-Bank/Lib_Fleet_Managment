// backend/src/app.js
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
// import mongoSanitize from 'express-mongo-sanitize';
// import xss from 'xss-clean';
import hpp from 'hpp';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';

// Import your routes 
// import authRoutes from './routes/authRoutes.js';
import vehicleRoutes from './routes/vehicleRoutes.js';
import generatorRoutes from './routes/generatorRoutes.js'
import foreclosureRoutes from './routes/foreclosureRoutes.js';
import maintenanceRoutes from './routes/maintenanceRoutes.js';
import trakingRoutes from './routes/trackingRoutes.js'
import agreementRoutes from './routes/agreementRoutes.js'
import insuranceRoutes from "./routes/insuranceRoutes.js";
import  reportRoutes from './routes/reportRoutes.js';
import tireRoutes from './routes/tireRoutes.js';
import reminderRoutes from './routes/reminderRoutes.js';


import errorHandler from './middleware/errorHandler.js';

const app = express();

// Fix __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.use(helmet());
app.use(compression());

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// app.use(mongoSanitize());
// app.use(xss());
app.use(hpp());

app.use(morgan('dev'));

// Rate limit 
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
// app.use('/api/auth', authLimiter);

// Debug middleware 
app.use((req, res, next) => {
  console.log(`📥 ${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
  next();
});


app.use('/uploads', express.static(path.join(__dirname, '../uploads')));


// app.use('/api/auth', authRoutes);
app.use('/api/v1/vehicles', vehicleRoutes);
app.use('/api/v1/forclosures', foreclosureRoutes);
app.use('/api/v1/maintenance', maintenanceRoutes);
app.use('/api/v1/generators', generatorRoutes);
app.use('/api/v1/tracking',trakingRoutes)
app.use('/api/v1/agreements',agreementRoutes)
app.use("/api/v1/insurance", insuranceRoutes);
app.use('/api/v1/tires', tireRoutes);
app.use("/api/v1/reports",  reportRoutes)
app.use('/api/v1/reminders', reminderRoutes);




// Add a test route to verify routing is working
app.get('/api/v1/test', (req, res) => {
  res.json({ 
    message: 'API test route is working',
    routes: ['/api/v1/vehicles', '/api/v1/forclosure', '/health']
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'LIB FMS Backend is running',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});


// app.all('*', (req, res) => {
//   res.status(404).json({
//     success: false,
//     message: `Cannot ${req.method} ${req.originalUrl} – Route not found`,
//   });
// });


app.use(errorHandler);

export default app;