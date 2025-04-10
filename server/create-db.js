const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

console.log('Скрипт создания базы данных...');

// Путь к файлу базы данных
const dbPath = path.join(__dirname, 'db/service_tasks.db');
console.log(`Путь к файлу базы данных: ${dbPath}`);

// Удаляем существующую базу данных если она есть
if (fs.existsSync(dbPath)) {
  console.log('Удаление существующей базы данных...');
  try {
    fs.unlinkSync(dbPath);
    console.log('Существующая база данных удалена');
  } catch (err) {
    console.error('Ошибка при удалении базы данных:', err);
    process.exit(1);
  }
}

// Создаем новую базу данных
console.log('Создание новой базы данных...');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Ошибка при создании базы данных:', err.message);
    process.exit(1);
  }
  console.log('База данных успешно создана');
});

// Включаем поддержку внешних ключей
db.run('PRAGMA foreign_keys = ON');

// Схема базы данных
const schema = [
  // Таблица companies
  `CREATE TABLE companies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
  
  // Таблица users
  `CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL,
    company_id INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id)
  )`,
  
  // Таблица tickets
  `CREATE TABLE tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'task',
    urgency TEXT NOT NULL DEFAULT 'medium',
    status TEXT NOT NULL DEFAULT 'open',
    priority TEXT NOT NULL DEFAULT 'medium',
    created_by INTEGER NOT NULL,
    assigned_to INTEGER,
    assigned_role TEXT,
    comment TEXT,
    company_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_by INTEGER,
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (assigned_to) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id),
    FOREIGN KEY (company_id) REFERENCES companies(id)
  )`,
  
  // Таблица ticket_history
  `CREATE TABLE ticket_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    action_type TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`,
  
  // Таблица ticket_comments
  `CREATE TABLE ticket_comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    comment TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`
];

// Выполняем запросы на создание схемы
console.log('Создание схемы базы данных...');
db.serialize(() => {
  schema.forEach(query => {
    db.run(query, err => {
      if (err) {
        console.error('Ошибка при создании схемы:', err.message);
      }
    });
  });
  
  console.log('Схема базы данных создана');
  
  // Функция для хеширования пароля
  async function hashPassword(password) {
    return await bcrypt.hash(password, 10);
  }

  // Завершаем создание базы данных
  console.log('Схема базы данных успешно создана');
  console.log('База данных инициализирована и готова к использованию');
  
  // Закрываем соединение с базой данных
  db.close(err => {
    if (err) {
      console.error('Ошибка при закрытии соединения с базой данных:', err.message);
    } else {
      console.log('Соединение с базой данных закрыто');
    }
  });
}); 