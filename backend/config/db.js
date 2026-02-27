const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config({ path: './project.env' });

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Handle connection errors
db.on('error', (err) => {
  console.error('Database connection error:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.error('Database connection was closed.');
  }
  if (err.code === 'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR') {
    console.error('Database had a fatal error.');
  }
  if (err.code === 'PROTOCOL_ENQUEUE_AFTER_CLOSE') {
    console.error('Database connection was manually closed.');
  }
});

module.exports = db;
