/**
 * Скрипт для обновления структуры базы данных
 * Добавляет столбец is_active в таблицу users
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Путь к базе данных
const dbPath = path.join(__dirname, 'database.sqlite');

// Проверка существования файла базы данных
if (!fs.existsSync(dbPath)) {
  console.error('База данных не найдена по пути:', dbPath);
  process.exit(1);
}

console.log('Подключение к базе данных...');
const db = new sqlite3.Database(dbPath);

// Начало транзакции
db.serialize(() => {
  db.run('BEGIN TRANSACTION;');

  // Проверка существования столбца is_active
  db.get("PRAGMA table_info(users);", (err, result) => {
    if (err) {
      console.error('Ошибка при проверке схемы таблицы users:', err);
      db.run('ROLLBACK;');
      db.close();
      process.exit(1);
    }

    // Добавление столбца is_active, если его нет
    console.log('Проверка наличия столбца is_active...');
    db.get("SELECT COUNT(*) as count FROM pragma_table_info('users') WHERE name = 'is_active';", (err, row) => {
      if (err) {
        console.error('Ошибка при проверке столбца is_active:', err);
        db.run('ROLLBACK;');
        db.close();
        process.exit(1);
      }

      if (row.count === 0) {
        console.log('Столбец is_active не найден. Добавление столбца...');
        db.run("ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT 1;", (err) => {
          if (err) {
            console.error('Ошибка при добавлении столбца is_active:', err);
            db.run('ROLLBACK;');
            db.close();
            process.exit(1);
          }
          
          console.log('Столбец is_active успешно добавлен.');
          db.run('COMMIT;');
          db.close();
          console.log('База данных успешно обновлена.');
        });
      } else {
        console.log('Столбец is_active уже существует.');
        db.run('COMMIT;');
        db.close();
        console.log('База данных актуальна.');
      }
    });
  });
}); 