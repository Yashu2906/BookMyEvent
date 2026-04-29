const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

const connectionConfig = process.env.MYSQL_URL || {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'bookmyevent',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const pool = mysql.createPool(connectionConfig);

// Use promises for async/await
const promisePool = pool.promise();

module.exports = promisePool;
