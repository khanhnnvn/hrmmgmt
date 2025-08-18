import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { config } from 'dotenv';
import seedInitialData from './seeders/initial-data.js';

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import { initDatabase } from './config/database.js';

// Import routes
import authRoutes from './routes/auth.js';
import employeeRoutes from './routes/employees.js';
import attendanceRoutes from './routes/attendance.js';
import leaveRoutes from './routes/leaves.js';
import taskRoutes from './routes/tasks.js';
import assetRoutes from './routes/assets.js';
import reportRoutes from './routes/reports.js';
import dashboardRoutes from './routes/dashboard.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'HRM API đang hoạt động', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Có lỗi xảy ra trên server' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'API endpoint không tồn tại' });
});

// Khởi tạo database và start server
const startServer = async () => {
  try {
    await initDatabase();
    
    app.listen(PORT, async () => {
      console.log(`🚀 HRM Server đang chạy tại http://localhost:${PORT}`);
      console.log(`📊 API Health Check: http://localhost:${PORT}/api/health`);
      
      // Initialize database with sample data
      try {
        await seedInitialData();
        console.log('📊 Database initialized with sample data');
      } catch (error) {
        console.error('❌ Failed to initialize database:', error);
      }
    });
  } catch (error) {
    console.error('Lỗi khởi động server:', error);
    process.exit(1);
  }
};

startServer();