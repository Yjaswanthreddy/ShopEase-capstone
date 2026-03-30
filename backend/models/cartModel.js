const { pool } = require('../config/database');

async function getOrCreateCartId(userId) {
  const [rows] = await pool.query('SELECT id FROM cart WHERE user_id = ?', [userId]);
  if (rows.length) return rows[0].id;
  const [r] = await pool.query('INSERT INTO cart (user_id) VALUES (?)', [userId]);
  return r.insertId;
}

module.exports = { getOrCreateCartId };
