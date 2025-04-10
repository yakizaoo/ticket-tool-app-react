const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db/service_tasks.db');

db.all('PRAGMA table_info(tickets)', (err, columns) => {
  if (err) {
    console.error('Ошибка:', err.message);
  } else {
    console.log('Столбцы таблицы tickets:');
    columns.forEach(col => {
      console.log(` - ${col.name} (${col.type})`);
    });
    
    // Проверяем, есть ли столбец updated_by
    const hasUpdatedBy = columns.some(col => col.name === 'updated_by');
    console.log(`\nСтолбец updated_by ${hasUpdatedBy ? 'существует' : 'отсутствует'} в таблице tickets`);
  }
  db.close();
}); 