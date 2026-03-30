/**
 * Loads schema (if needed) and seed data. Run: npm run seed
 * Requires MySQL and .env (copy from .env.example).
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'pass@word1',
    multipleStatements: true,
  });
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  await conn.query(schema);
  await conn.query(`USE ${process.env.DB_NAME || 'shopease'}`);

  const [users] = await conn.query('SELECT COUNT(*) AS c FROM users');
  if (users[0].c > 0) {
    console.log('Seed skipped: users already exist.');
    await conn.end();
    return;
  }

  const adminPass = await bcrypt.hash('Admin12345!', 10);
  const custPass = await bcrypt.hash('Customer123!', 10);
  await conn.query(
    `INSERT INTO users (email, password_hash, name, role) VALUES
     ('admin@shopease.test', ?, 'Shop Admin', 'admin'),
     ('customer@shopease.test', ?, 'Jane Customer', 'customer')`,
    [adminPass, custPass]
  );

  await conn.query(`INSERT INTO categories (name, slug) VALUES
    ('Electronics','electronics'), ('Fashion','fashion'), ('Home','home')`);

  const products = [
    [1, 'Soniq', 'NoiseCancel Headphones', 'ANC, 40h battery', 199.99, 45, 48],
    [1, 'Soniq', 'Wireless Earbuds', 'IPX4, charging case', 79.5, 120, 120],
    [1, 'VoltEdge', 'USB-C Charger 65W', 'GaN compact', 49.0, 200, 200],
    [2, 'UrbanThread', 'Denim Jacket', 'Classic fit', 89.0, 60, 60],
    [2, 'UrbanThread', 'Running Tee', 'Moisture wick', 29.99, 0, 150],
    [3, 'LumaLiving', 'Ceramic Table Lamp', 'Warm LED', 42.0, 35, 35],
    [3, 'LumaLiving', 'Storage Ottoman', 'Foldable', 65.0, 25, 25],
  ];

  for (const [cid, brand, name, desc, price, stock, pop] of products) {
    const [r] = await conn.query(
      `INSERT INTO products (category_id, brand, name, description, price, stock_quantity, rating_avg, popularity_score)
       VALUES (?,?,?,?,?,?,0,?)`,
      [cid, brand, name, desc, price, stock, pop]
    );
    const pid = r.insertId;
    await conn.query(
      `INSERT INTO product_images (product_id, url, sort_order) VALUES
       (?, '/assets/placeholder.svg', 0),
       (?, '/assets/placeholder.svg', 1)`,
      [pid, pid]
    );
  }

  console.log('Seed complete.');
  console.log('Admin: admin@shopease.test / Admin12345!');
  console.log('Customer: customer@shopease.test / Customer123!');
  await conn.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
