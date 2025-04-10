-- Таблица для настроек пользователей (базовая версия без auto_collapse_navbar)
CREATE TABLE IF NOT EXISTS user_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  theme TEXT DEFAULT 'light',
  notifications BOOLEAN DEFAULT 1,
  language TEXT DEFAULT 'ru',
  show_particles BOOLEAN DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Добавление колонки auto_collapse_navbar, если она не существует
-- SQLite не поддерживает IF NOT EXISTS для ADD COLUMN, поэтому используем проверку
-- Примечание: это будет выполнено только если запуск произойдет через initDb.js
INSERT OR REPLACE INTO pragma_user_version VALUES (0);
SELECT CASE 
  WHEN NOT EXISTS(SELECT 1 FROM pragma_table_info('user_settings') WHERE name = 'auto_collapse_navbar') THEN
    ALTER TABLE user_settings ADD COLUMN auto_collapse_navbar BOOLEAN DEFAULT 0
  ELSE
    SELECT 1
END;

-- Индекс для быстрого поиска настроек по пользователю
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id); 