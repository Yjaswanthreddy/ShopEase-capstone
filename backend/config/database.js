const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'pass@word1',
  database: process.env.DB_NAME || 'shopease',
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = { pool };
