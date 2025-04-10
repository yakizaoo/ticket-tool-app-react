const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '../../db/service_tasks.db');

// Ensure db directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize database schema synchronously
const schema = fs.readFileSync(path.join(__dirname, '../../db/schema.sql'), 'utf8');

// Open database connection
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err);
        process.exit(1);
    }
    console.log('Connected to database');
    
    // Enable foreign keys
    db.run('PRAGMA foreign_keys = ON');
    
    // Enable WAL mode for better concurrency
    db.run('PRAGMA journal_mode = WAL');
    
    // Initialize database schema synchronously
    db.exec(schema, (err) => {
        if (err) {
            console.error('Error initializing database schema:', err);
            process.exit(1);
        }
        console.log('Database schema initialized');
    });
});

// Helper function to run queries
const runQuery = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) {
                reject(err);
            } else {
                resolve(this);
            }
        });
    });
};

// Helper function to get single row
const getRow = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
};

// Helper function to get multiple rows
const getRows = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

// Close database connection
const closeDatabase = () => {
    return new Promise((resolve, reject) => {
        db.close((err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

// Initialize database schema synchronously
db.serialize(() => {
    db.run('PRAGMA foreign_keys = ON');
    db.run('PRAGMA journal_mode = WAL');
    db.exec(schema);
});

module.exports = {
    db,
    runQuery,
    getRow,
    getRows,
    closeDatabase
}; 