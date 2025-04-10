const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { checkUserRole } = require('../middleware/auth');

// Применяем middleware аутентификации ко всем маршрутам
router.use(checkUserRole);

// Получить настройки пользователя
router.get('/', settingsController.getUserSettings.bind(settingsController));

// Обновить все настройки
router.put('/', settingsController.updateSettings.bind(settingsController));

// Обновить только тему
router.patch('/theme', settingsController.updateTheme.bind(settingsController));

// Обновить настройки уведомлений
router.patch('/notifications', settingsController.updateNotifications.bind(settingsController));

// Обновить язык
router.patch('/language', settingsController.updateLanguage.bind(settingsController));

module.exports = router; 