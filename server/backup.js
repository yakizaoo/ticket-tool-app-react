const fs = require('fs');
const path = require('path');

// Создаем директорию для бэкапа
const backupDir = path.join(__dirname, 'backups', `v1_${new Date().toISOString().split('T')[0]}`);
fs.mkdirSync(backupDir, { recursive: true });

// Копируем файлы
const filesToBackup = [
  'server.js',
  'tests/api.test.js',
  'tests/setup.js',
  'db/schema.sql'
];

filesToBackup.forEach(file => {
  const sourcePath = path.join(__dirname, file);
  const destPath = path.join(backupDir, file);
  
  // Создаем директории для файла, если они не существуют
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  
  // Копируем файл
  fs.copyFileSync(sourcePath, destPath);
  console.log(`Backed up: ${file}`);
});

// Создаем файл с описанием версии
const versionInfo = {
  version: '1.0.0',
  date: new Date().toISOString(),
  description: 'Базовая версия с монолитным server.js',
  features: [
    'Управление компаниями',
    'Управление пользователями с разными ролями',
    'Управление тикетами'
  ],
  files: filesToBackup
};

fs.writeFileSync(
  path.join(backupDir, 'version.json'),
  JSON.stringify(versionInfo, null, 2)
);

console.log('\nBackup completed successfully!');
console.log(`Backup location: ${backupDir}`); 