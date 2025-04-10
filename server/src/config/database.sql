-- Таблица с настройками пользователей
CREATE TABLE IF NOT EXISTS user_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  theme TEXT NOT NULL DEFAULT 'light',
  notifications BOOLEAN NOT NULL DEFAULT 1,
  language TEXT NOT NULL DEFAULT 'ru',
  show_particles BOOLEAN NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
); 