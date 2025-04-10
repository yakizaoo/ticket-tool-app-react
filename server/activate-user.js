const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// ID пользователя для активации (вы можете изменить этот параметр)
const USER_ID = 1;

console.log('Скрипт активации пользователя...');
console.log(`Текущая директория: ${process.cwd()}`);
console.log(`Попытка активировать пользователя с ID: ${USER_ID}`);

// Путь к файлу базы данных
const dbPath = path.join(__dirname, 'database.sqlite');
console.log(`Путь к файлу базы данных: ${dbPath}`);

// Проверяем существование файла базы данных
if (!fs.existsSync(dbPath)) {
  console.error(`Файл базы данных не найден по пути: ${dbPath}`);
  console.log('Проверка файлов в текущей директории:');
  console.log(fs.readdirSync(__dirname));
  process.exit(1);
}

console.log(`Файл базы данных существует, размер: ${fs.statSync(dbPath).size} байт`);

// Подключение к базе данных
try {
  console.log('Подключение к базе данных...');
  const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
      console.error('Ошибка при подключении к базе данных:', err.message);
      process.exit(1);
    }
    console.log('Подключение к базе данных установлено');
    
    // Проверка структуры базы данных
    db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
      if (err) {
        console.error('Ошибка при получении списка таблиц:', err.message);
        db.close();
        process.exit(1);
      }
      
      console.log('Таблицы в базе данных:', tables);
      
      // Проверка существования таблицы users
      if (!tables.some(table => table.name === 'users')) {
        console.error('Таблица users не найдена в базе данных');
        db.close();
        process.exit(1);
      }
      
      console.log('Таблица users найдена');
      
      // Получение структуры таблицы users
      db.all("PRAGMA table_info(users)", [], (err, columns) => {
        if (err) {
          console.error('Ошибка при получении структуры таблицы users:', err.message);
          db.close();
          process.exit(1);
        }
        
        console.log('Структура таблицы users:', columns);
        
        // Проверяем наличие поля is_active
        const hasIsActive = columns.some(col => col.name === 'is_active');
        console.log('Наличие поля is_active:', hasIsActive);
        
        if (!hasIsActive) {
          console.log('Добавляем поле is_active в таблицу users...');
          db.run("ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT 1", (err) => {
            if (err) {
              console.error('Ошибка при добавлении поля is_active:', err.message);
              db.close();
              process.exit(1);
            }
            console.log('Поле is_active успешно добавлено');
            activateUser(db);
          });
        } else {
          activateUser(db);
        }
      });
    });
  });
} catch (error) {
  console.error('Непредвиденная ошибка:', error);
  process.exit(1);
}

function activateUser(db) {
  // Проверка существования пользователя с заданным ID
  db.get("SELECT * FROM users WHERE id = ?", [USER_ID], (err, user) => {
    if (err) {
      console.error('Ошибка при получении данных пользователя:', err.message);
      db.close();
      process.exit(1);
    }
    
    if (!user) {
      console.error(`Пользователь с ID ${USER_ID} не найден`);
      db.close();
      process.exit(1);
    }
    
    console.log('Найден пользователь:', user);
    
    // Активация пользователя
    db.run("UPDATE users SET is_active = 1 WHERE id = ?", [USER_ID], function(err) {
      if (err) {
        console.error('Ошибка при активации пользователя:', err.message);
        db.close();
        process.exit(1);
      }
      
      console.log(`Пользователь с ID ${USER_ID} успешно активирован`);
      console.log(`Количество измененных строк: ${this.changes}`);
      
      // Проверка результата активации
      db.get("SELECT * FROM users WHERE id = ?", [USER_ID], (err, updatedUser) => {
        if (err) {
          console.error('Ошибка при получении обновленных данных пользователя:', err.message);
        } else {
          console.log('Обновленные данные пользователя:', updatedUser);
        }
        
        db.close();
        console.log('Соединение с базой данных закрыто');
      });
    });
  });
} 