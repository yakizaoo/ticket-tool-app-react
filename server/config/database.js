const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../database.sqlite');

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

module.exports = db; 