const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

// Данные нового пользователя-владельца
const newOwner = {
  email: 'super.admin@servicetask.ru',
  password: 'owner123', // Это пароль будет захеширован
  full_name: 'Супер Администратор',
  role: 'owner',
  company_name: 'ServiceTask Admin', // Название компании
  is_active: 1 // Активен
};

console.log('Скрипт создания нового пользователя-владельца...');

// Путь к файлу базы данных
const dbPath = path.join(__dirname, 'db/service_tasks.db');
console.log(`Путь к файлу базы данных: ${dbPath}`);

// Функция для хеширования пароля
async function hashPassword(password) {
  const saltRounds = 10;
  try {
    return await bcrypt.hash(password, saltRounds);
  } catch (err) {
    console.error('Ошибка при хешировании пароля:', err);
    throw err;
  }
}

// Подключение к базе данных
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error('Ошибка при подключении к базе данных:', err.message);
    process.exit(1);
  }
  console.log('Подключение к базе данных установлено');
});

// Проверка существования таблицы users
db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='users'", (err, table) => {
  if (err) {
    console.error('Ошибка при проверке таблицы users:', err.message);
    db.close();
    process.exit(1);
  }
  
  if (!table) {
    console.error('Таблица users не найдена в базе данных');
    db.close();
    process.exit(1);
  }
  
  console.log('Таблица users найдена');
  
  // Сначала создаем компанию
  db.run("INSERT INTO companies (name) VALUES (?)", [newOwner.company_name], function(err) {
    if (err) {
      console.error('Ошибка при создании компании:', err.message);
      db.close();
      process.exit(1);
    }
    
    const companyId = this.lastID;
    console.log(`Создана компания: ${newOwner.company_name} (ID: ${companyId})`);
    
    // Проверка существования пользователя с таким email
    db.get("SELECT id, email FROM users WHERE email = ?", [newOwner.email], (err, existingUser) => {
      if (err) {
        console.error('Ошибка при проверке существующего пользователя:', err.message);
        db.close();
        process.exit(1);
      }
      
      if (existingUser) {
        console.error(`Пользователь с email ${newOwner.email} уже существует (ID: ${existingUser.id})`);
        db.close();
        process.exit(1);
      }
      
      console.log('Email свободен, создаем нового пользователя...');
      
      // Хешируем пароль и создаем пользователя
      hashPassword(newOwner.password).then(hashedPassword => {
        const sql = `
          INSERT INTO users (email, password, full_name, role, company_id, is_active)
          VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        db.run(sql, [
          newOwner.email,
          hashedPassword,
          newOwner.full_name,
          newOwner.role,
          companyId,
          newOwner.is_active
        ], function(err) {
          if (err) {
            console.error('Ошибка при создании пользователя:', err.message);
            db.close();
            process.exit(1);
          }
          
          const userId = this.lastID;
          console.log(`Пользователь-владелец успешно создан с ID: ${userId}`);
          
          // Получение созданного пользователя для проверки
          db.get("SELECT * FROM users WHERE id = ?", [userId], (err, user) => {
            if (err) {
              console.error('Ошибка при получении данных созданного пользователя:', err.message);
            } else {
              const { password, ...userInfo } = user; // Удаляем пароль из вывода
              console.log('Созданный пользователь:', userInfo);
            }
            
            // Выводим информацию для входа
            console.log('\nИнформация для входа:');
            console.log(`Email: ${newOwner.email}`);
            console.log(`Пароль: ${newOwner.password}`);
            
            db.close();
            console.log('Соединение с базой данных закрыто');
          });
        });
      }).catch(err => {
        console.error('Ошибка при хешировании пароля:', err);
        db.close();
        process.exit(1);
      });
    });
  });
}); 