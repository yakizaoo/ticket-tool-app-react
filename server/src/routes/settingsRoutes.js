const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const authMiddleware = require('../middleware/authMiddleware');

// Получение настроек пользователя
router.get('/', authMiddleware, settingsController.getUserSettings);

// Обновление всех настроек
router.put('/', authMiddleware, settingsController.updateSettings);

// PUT или PATCH запросы для обновления отдельных настроек
router.patch('/theme', authMiddleware, settingsController.updateTheme);
router.patch('/notifications', authMiddleware, settingsController.updateNotifications);
router.patch('/language', authMiddleware, settingsController.updateLanguage);
router.patch('/particles', authMiddleware, settingsController.updateParticles);
router.patch('/navbar', authMiddleware, settingsController.updateNavbarCollapse);

module.exports = router; 