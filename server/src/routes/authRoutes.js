const express = require('express');
const router = express.Router();
const { db } = require('../config/database');
const { register, login } = require('../controllers/authController');

// Маршрут для регистрации
router.post('/register', register);

// Маршрут для входа
router.post('/login', login);

// Временный маршрут для проверки базы данных
router.get('/check-db', (req, res) => {
  console.log('Checking database...');
  
  // Проверяем компании
  db.all('SELECT * FROM companies', [], (err, companies) => {
    if (err) {
      console.error('Error fetching companies:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    console.log('All companies:', companies);
    
    // Проверяем пользователей
    db.all('SELECT * FROM users', [], (err, users) => {
      if (err) {
        console.error('Error fetching users:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      console.log('All users:', users);
      
      res.json({
        companies,
        users
      });
    });
  });
});

module.exports = router; 