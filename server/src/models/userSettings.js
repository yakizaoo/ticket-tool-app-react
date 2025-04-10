const { db, runQuery, getRow, getRows } = require('../config/database');

class UserSettings {
  // Получить настройки пользователя
  static async getByUserId(userId) {
    try {
      const settings = await getRow(
        `SELECT * FROM user_settings WHERE user_id = ?`,
        [userId]
      );
      
      // Если настроек нет, создаем значения по умолчанию
      if (!settings) {
        return await this.createDefault(userId);
      }
      
      // Преобразуем данные для фронтенда с корректными именами свойств
      const result = {
        ...settings,
        // Преобразуем snake_case в camelCase для совместимости с фронтендом
        showParticles: settings.show_particles === 1 || settings.show_particles === true, 
        autoCollapseNavbar: settings.auto_collapse_navbar === 1 || settings.auto_collapse_navbar === true
      };
      
      return result;
    } catch (error) {
      console.error('Error getting user settings:', error);
      throw error;
    }
  }

  // Создать настройки по умолчанию
  static async createDefault(userId) {
    try {
      const defaultSettings = {
        theme: 'light',
        notifications: true,
        language: 'ru',
        showParticles: false,
        autoCollapseNavbar: false
      };
      
      await runQuery(
        `INSERT INTO user_settings (user_id, theme, notifications, language, show_particles, auto_collapse_navbar) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, defaultSettings.theme, defaultSettings.notifications, defaultSettings.language, defaultSettings.showParticles, defaultSettings.autoCollapseNavbar]
      );
      
      return await this.getByUserId(userId);
    } catch (error) {
      console.error('Error creating default user settings:', error);
      throw error;
    }
  }

  // Обновить настройки
  static async update(userId, settings) {
    try {
      const { theme, notifications, language, showParticles, autoCollapseNavbar } = settings;
      
      // Проверяем существование колонки auto_collapse_navbar
      try {
        await runQuery(
          `UPDATE user_settings 
           SET theme = ?, notifications = ?, language = ?, show_particles = ?, auto_collapse_navbar = ?, updated_at = CURRENT_TIMESTAMP 
           WHERE user_id = ?`,
          [theme, notifications, language, showParticles, autoCollapseNavbar, userId]
        );
      } catch (error) {
        // Если ошибка из-за отсутствия колонки, добавим ее
        if (error.message.includes('no such column: auto_collapse_navbar')) {
          console.log('Добавляем колонку auto_collapse_navbar');
          
          // Добавляем колонку
          await runQuery(`ALTER TABLE user_settings ADD COLUMN auto_collapse_navbar BOOLEAN DEFAULT 0`);
          
          // Повторяем запрос на обновление
          await runQuery(
            `UPDATE user_settings 
             SET theme = ?, notifications = ?, language = ?, show_particles = ?, auto_collapse_navbar = ?, updated_at = CURRENT_TIMESTAMP 
             WHERE user_id = ?`,
            [theme, notifications, language, showParticles, autoCollapseNavbar, userId]
          );
        } else {
          throw error;
        }
      }
      
      return await this.getByUserId(userId);
    } catch (error) {
      console.error('Error updating user settings:', error);
      throw error;
    }
  }

  // Обновить только тему
  static async updateTheme(userId, theme) {
    try {
      await runQuery(
        `UPDATE user_settings 
         SET theme = ?, updated_at = CURRENT_TIMESTAMP 
         WHERE user_id = ?`,
        [theme, userId]
      );
      
      return await this.getByUserId(userId);
    } catch (error) {
      console.error('Error updating theme:', error);
      throw error;
    }
  }

  // Обновить настройки уведомлений
  static async updateNotifications(userId, notifications) {
    try {
      await runQuery(
        `UPDATE user_settings 
         SET notifications = ?, updated_at = CURRENT_TIMESTAMP 
         WHERE user_id = ?`,
        [notifications, userId]
      );
      
      return await this.getByUserId(userId);
    } catch (error) {
      console.error('Error updating notifications:', error);
      throw error;
    }
  }

  // Обновить язык
  static async updateLanguage(userId, language) {
    try {
      await runQuery(
        `UPDATE user_settings 
         SET language = ?, updated_at = CURRENT_TIMESTAMP 
         WHERE user_id = ?`,
        [language, userId]
      );
      
      return await this.getByUserId(userId);
    } catch (error) {
      console.error('Error updating language:', error);
      throw error;
    }
  }

  // Обновить отображение частиц
  static async updateShowParticles(userId, showParticles) {
    try {
      console.log('updateShowParticles called with:', { userId, showParticles });
      
      // Проверяем существование строки с настройками
      const existingSettings = await getRow('SELECT * FROM user_settings WHERE user_id = ?', [userId]);
      if (!existingSettings) {
        console.log('No existing settings, creating default');
        return await this.createDefault(userId);
      }
      
      // Пробуем выполнить запрос для изменения show_particles
      try {
        await runQuery(
          `UPDATE user_settings 
           SET show_particles = ?, updated_at = CURRENT_TIMESTAMP 
           WHERE user_id = ?`,
          [showParticles, userId]
        );
      } catch (queryError) {
        console.error('SQL error in updateShowParticles:', queryError);
        // Проверяем существование колонки show_particles
        const tableInfo = await getRows(`PRAGMA table_info(user_settings)`);
        console.log('Table structure:', tableInfo);
        
        // Если колонки нет, добавляем её
        if (!tableInfo.some(col => col.name === 'show_particles')) {
          console.log('Adding show_particles column');
          await runQuery(`ALTER TABLE user_settings ADD COLUMN show_particles BOOLEAN NOT NULL DEFAULT 1`);
          
          // Повторяем запрос на обновление
          await runQuery(
            `UPDATE user_settings 
             SET show_particles = ?, updated_at = CURRENT_TIMESTAMP 
             WHERE user_id = ?`,
            [showParticles, userId]
          );
        } else {
          throw queryError;
        }
      }
      
      // Получаем обновленные настройки
      return await this.getByUserId(userId);
    } catch (error) {
      console.error('Error updating particles setting:', error);
      throw error;
    }
  }

  // Обновить настройку автосворачивания меню
  static async updateAutoCollapseNavbar(userId, autoCollapseNavbar) {
    try {
      console.log('updateAutoCollapseNavbar called with:', { userId, autoCollapseNavbar });
      
      // Проверяем существование строки с настройками
      const existingSettings = await getRow('SELECT * FROM user_settings WHERE user_id = ?', [userId]);
      if (!existingSettings) {
        console.log('No existing settings, creating default');
        return await this.createDefault(userId);
      }
      
      // Пробуем выполнить запрос для изменения auto_collapse_navbar
      try {
        await runQuery(
          `UPDATE user_settings 
           SET auto_collapse_navbar = ?, updated_at = CURRENT_TIMESTAMP 
           WHERE user_id = ?`,
          [autoCollapseNavbar, userId]
        );
      } catch (queryError) {
        console.error('SQL error in updateAutoCollapseNavbar:', queryError);
        // Проверяем существование колонки auto_collapse_navbar
        const tableInfo = await getRows(`PRAGMA table_info(user_settings)`);
        console.log('Table structure:', tableInfo);
        
        // Если колонки нет, добавляем её
        if (!tableInfo.some(col => col.name === 'auto_collapse_navbar')) {
          console.log('Adding auto_collapse_navbar column');
          await runQuery(`ALTER TABLE user_settings ADD COLUMN auto_collapse_navbar BOOLEAN NOT NULL DEFAULT 0`);
          
          // Повторяем запрос на обновление
          await runQuery(
            `UPDATE user_settings 
             SET auto_collapse_navbar = ?, updated_at = CURRENT_TIMESTAMP 
             WHERE user_id = ?`,
            [autoCollapseNavbar, userId]
          );
        } else {
          throw queryError;
        }
      }
      
      // Получаем обновленные настройки
      return await this.getByUserId(userId);
    } catch (error) {
      console.error('Error updating navbar setting:', error);
      throw error;
    }
  }
}

module.exports = UserSettings; 