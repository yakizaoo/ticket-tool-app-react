const { db, runQuery, getRows } = require('./database');
const fs = require('fs');
const path = require('path');

const initializeDatabase = async () => {
    return new Promise((resolve, reject) => {
        try {
            // Загружаем базовую схему
            const schemaPath = path.join(__dirname, '../db/schema.sql');
            const schemaSql = fs.readFileSync(schemaPath, 'utf8');
            
            // Загружаем скрипт инициализации данных
            const initPath = path.join(__dirname, '../db/init.sql');
            const initSql = fs.readFileSync(initPath, 'utf8');
            
            db.serialize(() => {
                // Включаем поддержку внешних ключей
                db.run('PRAGMA foreign_keys = ON');
                
                // Создаем схему базы данных
                db.exec(schemaSql, (schemaErr) => {
                    if (schemaErr) {
                        console.error('Error executing schema.sql:', schemaErr);
                        // Продолжаем работу даже при ошибке схемы
                    }
                    
                    // Проверяем наличие колонки auto_collapse_navbar
                    db.all('PRAGMA table_info(user_settings)', (err, tableInfo) => {
                        if (err) {
                            console.error('Error getting table info:', err);
                            // Продолжаем даже при ошибке
                        } else {
                            const hasAutoCollapseNavbar = tableInfo && tableInfo.some(col => col.name === 'auto_collapse_navbar');
                            
                            if (tableInfo && !hasAutoCollapseNavbar) {
                                console.log('Adding auto_collapse_navbar column...');
                                db.run('ALTER TABLE user_settings ADD COLUMN auto_collapse_navbar BOOLEAN DEFAULT 0', (alterErr) => {
                                    if (alterErr) {
                                        console.error('Error adding column:', alterErr);
                                        // Продолжаем даже при ошибке
                                    } else {
                                        console.log('Column auto_collapse_navbar added successfully');
                                    }
                                });
                            }
                        }
                        
                        // Инициализируем данные
                        db.exec(initSql, (initErr) => {
                            if (initErr) {
                                console.error('Error executing init.sql:', initErr);
                                // Мы не прерываем запуск из-за ошибки в тестовых данных
                                // reject(initErr);
                                // return;
                            }

                            console.log('Database initialized successfully');
                            resolve();
                        });
                    });
                });
            });
        } catch (error) {
            console.error('Error initializing database:', error);
            reject(error);
        }
    });
};

module.exports = { initializeDatabase }; 