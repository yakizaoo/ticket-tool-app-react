const UserSettings = require('../models/userSettings');

class SettingsController {
  // Получить настройки текущего пользователя
  async getUserSettings(req, res) {
    try {
      const userId = req.user.id;
      const settings = await UserSettings.getByUserId(userId);
      
      return res.json(settings);
    } catch (error) {
      console.error('Error fetching user settings:', error);
      return res.status(500).json({ error: 'Ошибка при получении настроек пользователя' });
    }
  }
  
  // Обновить все настройки
  async updateSettings(req, res) {
    try {
      const userId = req.user.id;
      const { theme, notifications, language } = req.body;
      
      // Проверка валидности полей
      const validThemes = ['light', 'dark'];
      const validLanguages = ['ru', 'en'];
      
      if (theme && !validThemes.includes(theme)) {
        return res.status(400).json({ error: 'Недопустимое значение темы' });
      }
      
      if (language && !validLanguages.includes(language)) {
        return res.status(400).json({ error: 'Недопустимое значение языка' });
      }
      
      // Создаем объект с настройками для обновления
      const updatedSettings = {};
      if (theme !== undefined) updatedSettings.theme = theme;
      if (notifications !== undefined) updatedSettings.notifications = notifications;
      if (language !== undefined) updatedSettings.language = language;
      
      // Обновляем только те настройки, которые были переданы
      const settings = await UserSettings.update(userId, {
        ...(await UserSettings.getByUserId(userId)),
        ...updatedSettings
      });
      
      return res.json(settings);
    } catch (error) {
      console.error('Error updating user settings:', error);
      return res.status(500).json({ error: 'Ошибка при обновлении настроек пользователя' });
    }
  }
  
  // Обновить тему
  async updateTheme(req, res) {
    try {
      const userId = req.user.id;
      const { theme } = req.body;
      
      // Проверка валидности темы
      const validThemes = ['light', 'dark'];
      if (!validThemes.includes(theme)) {
        return res.status(400).json({ error: 'Недопустимое значение темы' });
      }
      
      const settings = await UserSettings.updateTheme(userId, theme);
      return res.json(settings);
    } catch (error) {
      console.error('Error updating theme:', error);
      return res.status(500).json({ error: 'Ошибка при обновлении темы' });
    }
  }
  
  // Обновить настройки уведомлений
  async updateNotifications(req, res) {
    try {
      const userId = req.user.id;
      const { notifications } = req.body;
      
      // Проверяем, что значение является булевым
      if (typeof notifications !== 'boolean') {
        return res.status(400).json({ error: 'Значение уведомлений должно быть булевым' });
      }
      
      const settings = await UserSettings.updateNotifications(userId, notifications);
      return res.json(settings);
    } catch (error) {
      console.error('Error updating notifications:', error);
      return res.status(500).json({ error: 'Ошибка при обновлении настроек уведомлений' });
    }
  }
  
  // Обновить язык
  async updateLanguage(req, res) {
    try {
      const userId = req.user.id;
      const { language } = req.body;
      
      // Проверка валидности языка
      const validLanguages = ['ru', 'en'];
      if (!validLanguages.includes(language)) {
        return res.status(400).json({ error: 'Недопустимое значение языка' });
      }
      
      const settings = await UserSettings.updateLanguage(userId, language);
      return res.json(settings);
    } catch (error) {
      console.error('Error updating language:', error);
      return res.status(500).json({ error: 'Ошибка при обновлении языка' });
    }
  }

  // Обновление настройки показа частиц
  async updateParticles(req, res) {
    try {
      const { id } = req.user;
      const { showParticles } = req.body;

      if (typeof showParticles !== 'boolean') {
        return res.status(400).json({ error: 'Некорректное значение для параметра showParticles' });
      }

      const settings = await UserSettings.updateShowParticles(id, showParticles);
      res.json(settings);
    } catch (error) {
      console.error('Error updating particles settings:', error);
      res.status(500).json({ error: 'Ошибка сервера при обновлении настроек' });
    }
  }

  // Обновление настройки автосворачивания панели навигации
  async updateNavbarCollapse(req, res) {
    try {
      const { id } = req.user;
      const { autoCollapseNavbar } = req.body;

      if (typeof autoCollapseNavbar !== 'boolean') {
        return res.status(400).json({ error: 'Некорректное значение для параметра autoCollapseNavbar' });
      }

      const settings = await UserSettings.updateAutoCollapseNavbar(id, autoCollapseNavbar);
      res.json(settings);
    } catch (error) {
      console.error('Error updating navbar collapse settings:', error);
      res.status(500).json({ error: 'Ошибка сервера при обновлении настроек' });
    }
  }
}

module.exports = new SettingsController(); 