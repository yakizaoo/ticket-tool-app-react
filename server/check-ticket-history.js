const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db/service_tasks.db');

db.all('PRAGMA table_info(ticket_history)', (err, columns) => {
  if (err) {
    console.error('Ошибка:', err.message);
  } else {
    console.log('Столбцы таблицы ticket_history:');
    columns.forEach(col => {
      console.log(` - ${col.name} (${col.type})`);
    });
  }
  
  // Проверяем внешние ключи
  db.all('PRAGMA foreign_key_list(ticket_history)', (err, foreignKeys) => {
    if (err) {
      console.error('Ошибка при получении информации о внешних ключах:', err.message);
    } else {
      console.log('\nВнешние ключи таблицы ticket_history:');
      foreignKeys.forEach(fk => {
        console.log(` - ${fk.from} -> ${fk.table}(${fk.to})`);
      });
    }
    db.close();
  });
}); 