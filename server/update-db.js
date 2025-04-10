const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Путь к базе данных
const dbPath = path.join(__dirname, 'db', 'service_tasks.db');

// Создаем директорию для базы данных, если ее нет
if (!fs.existsSync(path.dirname(dbPath))) {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  console.log('Создана директория для базы данных');
}

// Копируем файл из временной директории, если файл указан
const sourcePath = 'c:/Users/ramza/AppData/Local/Temp/7zEC0535DE1';
if (fs.existsSync(sourcePath)) {
  try {
    fs.copyFileSync(sourcePath, dbPath);
    console.log('База данных успешно восстановлена из резервной копии');
  } catch (err) {
    console.error('Ошибка при копировании файла базы данных:', err);
  }
}

// Проверяем и создаем таблицы, которых нет в существующей БД
const db = new sqlite3.Database(dbPath);

// Включаем поддержку внешних ключей
db.run('PRAGMA foreign_keys = ON');

// Проверяем наличие таблиц и создаем их при необходимости
db.serialize(() => {
  // Проверяем и создаем таблицу companies
  db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='companies'", (err, row) => {
    if (err) {
      console.error('Ошибка при проверке таблицы companies:', err.message);
    } else if (!row) {
      console.log('Создаем таблицу companies...');
      db.run(`
        CREATE TABLE companies (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (createErr) => {
        if (createErr) console.error('Ошибка при создании таблицы companies:', createErr.message);
        else console.log('Таблица companies успешно создана');
      });
    } else {
      console.log('Таблица companies уже существует');
    }
  });

  // Проверяем и создаем таблицу users
  db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='users'", (err, row) => {
    if (err) {
      console.error('Ошибка при проверке таблицы users:', err.message);
    } else if (!row) {
      console.log('Создаем таблицу users...');
      db.run(`
        CREATE TABLE users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          full_name TEXT NOT NULL,
          role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'tech_admin', 'user')),
          company_id INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (company_id) REFERENCES companies(id)
        )
      `, (createErr) => {
        if (createErr) console.error('Ошибка при создании таблицы users:', createErr.message);
        else console.log('Таблица users успешно создана');
      });
    } else {
      console.log('Таблица users уже существует');
      // Проверяем наличие поля is_active и добавляем его, если его нет
      db.all('PRAGMA table_info(users)', (pragmaErr, columns) => {
        if (pragmaErr) {
          console.error('Ошибка при получении информации о таблице users:', pragmaErr.message);
        } else {
          const hasIsActive = columns.some(col => col.name === 'is_active');
          if (!hasIsActive) {
            console.log('Добавляем поле is_active в таблицу users...');
            db.run('ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT 1', (alterErr) => {
              if (alterErr) console.error('Ошибка при добавлении поля is_active:', alterErr.message);
              else console.log('Поле is_active успешно добавлено в таблицу users');
            });
          } else {
            console.log('Поле is_active уже существует в таблице users');
          }
        }
      });
    }
  });

  // Проверяем и создаем таблицу tickets
  db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='tickets'", (err, row) => {
    if (err) {
      console.error('Ошибка при проверке таблицы tickets:', err.message);
    } else if (!row) {
      console.log('Создаем таблицу tickets...');
      db.run(`
        CREATE TABLE tickets (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT,
          category TEXT NOT NULL CHECK (category IN ('bug', 'feature', 'task', 'other')),
          urgency TEXT NOT NULL CHECK (urgency IN ('low', 'medium', 'high')),
          status TEXT NOT NULL CHECK (status IN ('open', 'in_progress', 'resolved', 'closed', 'archived', 'hidden')),
          company_id INTEGER NOT NULL,
          created_by INTEGER NOT NULL,
          assigned_role TEXT CHECK (assigned_role IN ('admin', 'tech_admin')),
          comment TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_by INTEGER REFERENCES users(id),
          FOREIGN KEY (company_id) REFERENCES companies(id),
          FOREIGN KEY (created_by) REFERENCES users(id)
        )
      `, (createErr) => {
        if (createErr) console.error('Ошибка при создании таблицы tickets:', createErr.message);
        else console.log('Таблица tickets успешно создана');
      });
    } else {
      console.log('Таблица tickets уже существует');
      // Проверяем наличие поля updated_by и добавляем его, если его нет
      db.all('PRAGMA table_info(tickets)', (pragmaErr, columns) => {
        if (pragmaErr) {
          console.error('Ошибка при получении информации о таблице tickets:', pragmaErr.message);
        } else {
          const hasUpdatedBy = columns.some(col => col.name === 'updated_by');
          if (!hasUpdatedBy) {
            console.log('Добавляем поле updated_by в таблицу tickets...');
            db.run('ALTER TABLE tickets ADD COLUMN updated_by INTEGER REFERENCES users(id)', (alterErr) => {
              if (alterErr) console.error('Ошибка при добавлении поля updated_by:', alterErr.message);
              else console.log('Поле updated_by успешно добавлено в таблицу tickets');
            });
          } else {
            console.log('Поле updated_by уже существует в таблице tickets');
          }
        }
      });
    }
  });

  // Проверяем и создаем таблицу ticket_comments
  db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='ticket_comments'", (err, row) => {
    if (err) {
      console.error('Ошибка при проверке таблицы ticket_comments:', err.message);
    } else if (!row) {
      console.log('Создаем таблицу ticket_comments...');
      db.run(`
        CREATE TABLE ticket_comments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          ticket_id INTEGER NOT NULL,
          user_id INTEGER NOT NULL,
          comment TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `, (createErr) => {
        if (createErr) console.error('Ошибка при создании таблицы ticket_comments:', createErr.message);
        else console.log('Таблица ticket_comments успешно создана');
      });
    } else {
      console.log('Таблица ticket_comments уже существует');
    }
  });

  // Проверяем и создаем таблицу ticket_history
  db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='ticket_history'", (err, row) => {
    if (err) {
      console.error('Ошибка при проверке таблицы ticket_history:', err.message);
    } else if (!row) {
      console.log('Создаем таблицу ticket_history...');
      db.run(`
        CREATE TABLE ticket_history (
          id INTEGER PRIMARY KEY AUTOINCREMENT, 
          ticket_id INTEGER NOT NULL, 
          user_id INTEGER NOT NULL, 
          action_type TEXT NOT NULL, 
          old_value TEXT, 
          new_value TEXT, 
          comment TEXT, 
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE, 
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `, (createErr) => {
        if (createErr) console.error('Ошибка при создании таблицы ticket_history:', createErr.message);
        else console.log('Таблица ticket_history успешно создана');
      });
    } else {
      console.log('Таблица ticket_history уже существует');
    }
  });

  // Создаем индексы для ускорения поиска
  db.run('CREATE INDEX IF NOT EXISTS idx_tickets_company ON tickets(company_id)', (err) => {
    if (err) console.error('Ошибка при создании индекса idx_tickets_company:', err.message);
    else console.log('Индекс idx_tickets_company успешно создан или уже существует');
  });

  db.run('CREATE INDEX IF NOT EXISTS idx_users_company ON users(company_id)', (err) => {
    if (err) console.error('Ошибка при создании индекса idx_users_company:', err.message);
    else console.log('Индекс idx_users_company успешно создан или уже существует');
  });

  // Выводим финальный список таблиц
  db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
    if (err) {
      console.error('Ошибка при получении списка таблиц:', err.message);
    } else {
      console.log('\nТаблицы в базе данных после обновления:');
      tables.forEach(table => console.log(`- ${table.name}`));
    }
    
    // Закрываем соединение с базой данных
    db.close((closeErr) => {
      if (closeErr) {
        console.error('Ошибка при закрытии соединения с базой данных:', closeErr.message);
      } else {
        console.log('\nСоединение с базой данных закрыто');
        console.log('Обновление базы данных завершено');
      }
    });
  });
}); 