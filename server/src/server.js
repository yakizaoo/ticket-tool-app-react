const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { initializeDatabase } = require('./config/initDb');
const authRoutes = require('./routes/authRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const userRoutes = require('./routes/userRoutes');
const companyRoutes = require('./routes/companyRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// Отладочная информация
console.log('Environment variables:', {
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV,
  CORS_ORIGIN: process.env.CORS_ORIGIN
});

const app = express();
const port = process.env.PORT || 5000;

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'user-id', 'Accept', 'Origin', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan('dev'));
app.use(cookieParser());

// Предварительная обработка OPTIONS запросов для CORS
app.options('*', cors(corsOptions));

// Добавим middleware для логирования запросов
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/users', userRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/settings', settingsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Что-то пошло не так!' });
});

// Инициализация базы данных и запуск сервера
initializeDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
      console.log(`CORS origin: ${corsOptions.origin}`);
      console.log('Available routes:');
      console.log('- GET /api/auth/check-db');
      console.log('- POST /api/auth/login');
      console.log('- POST /api/auth/register');
    });
  })
  .catch(error => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  });

module.exports = {
  app,
  initializeDatabase
}; 