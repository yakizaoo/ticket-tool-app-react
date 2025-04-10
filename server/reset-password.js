const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');
const readline = require('readline');

// Создаем интерфейс для ввода с консоли
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

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

// Показываем список пользователей
db.all(
  `SELECT u.id, u.email, u.full_name, u.role, u.company_id, c.name AS company_name
   FROM users u
   LEFT JOIN companies c ON u.company_id = c.id
   ORDER BY u.id`,
  (err, users) => {
    if (err) {
      console.error('Ошибка при получении списка пользователей:', err.message);
      db.close();
      process.exit(1);
    }

    console.log('\nСписок пользователей:');
    users.forEach(user => {
      console.log(`ID: ${user.id}, Email: ${user.email}, Имя: ${user.full_name}, Роль: ${user.role}, Компания: ${user.company_name}`);
    });

    // Запрашиваем ID пользователя
    rl.question('\nВведите ID пользователя, для которого нужно сбросить пароль: ', (userId) => {
      // Запрашиваем новый пароль
      rl.question('Введите новый пароль: ', async (newPassword) => {
        try {
          // Хешируем пароль
          const hashedPassword = await hashPassword(newPassword);
          
          // Обновляем пароль в базе данных
          db.run(
            'UPDATE users SET password = ? WHERE id = ?',
            [hashedPassword, userId],
            function(err) {
              if (err) {
                console.error('Ошибка при обновлении пароля:', err.message);
                db.close();
                rl.close();
                process.exit(1);
              }

              if (this.changes === 0) {
                console.error(`Пользователь с ID ${userId} не найден`);
              } else {
                console.log(`Пароль для пользователя с ID ${userId} успешно обновлен`);
                
                // Проверяем, что пароль обновился
                db.get('SELECT email FROM users WHERE id = ?', [userId], (err, user) => {
                  if (err) {
                    console.error('Ошибка при получении данных пользователя:', err.message);
                  } else if (user) {
                    console.log(`\nНовые данные для входа:`);
                    console.log(`Email: ${user.email}`);
                    console.log(`Пароль: ${newPassword}`);
                  }
                  
                  // Закрываем соединение с базой данных и консольным интерфейсом
                  db.close();
                  rl.close();
                });
              }
            }
          );
        } catch (err) {
          console.error('Ошибка при сбросе пароля:', err);
          db.close();
          rl.close();
          process.exit(1);
        }
      });
    });
  }
); 