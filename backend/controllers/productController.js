const { body, param, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { asyncHandler } = require('../utils/asyncHandler');

function listQuery(q) {
  const {
    search = '',
    categoryId,
    brand,
    minPrice,
    maxPrice,
    minRating,
    inStock,
    sort = 'name',
    page = 1,
    limit = 12,
  } = q;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(48, Math.max(1, parseInt(limit, 10) || 12));
  const offset = (pageNum - 1) * limitNum;
  const cond = ['1=1'];
  const params = [];
  if (search) {
    cond.push('(p.name LIKE ? OR p.description LIKE ? OR p.brand LIKE ?)');
    const like = `%${search}%`;
    params.push(like, like, like);
  }
  if (categoryId) {
    cond.push('p.category_id = ?');
    params.push(categoryId);
  }
  if (brand) {
    cond.push('p.brand = ?');
    params.push(brand);
  }
  if (minPrice !== undefined && minPrice !== '') {
    cond.push('p.price >= ?');
    params.push(Number(minPrice));
  }
  if (maxPrice !== undefined && maxPrice !== '') {
    cond.push('p.price <= ?');
    params.push(Number(maxPrice));
  }
  if (minRating !== undefined && minRating !== '') {
    cond.push('p.rating_avg >= ?');
    params.push(Number(minRating));
  }
  if (inStock === '1' || inStock === 'true') {
    cond.push('p.stock_quantity > 0');
  }
  let order = 'p.name ASC';
  if (sort === 'price_asc') order = 'p.price ASC';
  if (sort === 'price_desc') order = 'p.price DESC';
  if (sort === 'latest') order = 'p.created_at DESC';
  if (sort === 'popularity') order = 'p.popularity_score DESC, p.rating_avg DESC';
  if (sort === 'rating') order = 'p.rating_avg DESC';
  const where = cond.join(' AND ');
  return { where, params, order, limitNum, offset, pageNum };
}

const listProducts = asyncHandler(async (req, res) => {
  const { where, params, order, limitNum, offset, pageNum } = listQuery(req.query);
  const countSql = `SELECT COUNT(*) AS c FROM products p JOIN categories c ON c.id=p.category_id WHERE ${where}`;
  const [cnt] = await pool.query(countSql, params);
  const total = cnt[0].c;
  const sql = `
    SELECT p.id, p.brand, p.name, p.description, p.price, p.stock_quantity, p.rating_avg, p.popularity_score, p.created_at,
           p.category_id, c.name AS category_name,
           (SELECT url FROM product_images pi WHERE pi.product_id=p.id ORDER BY sort_order LIMIT 1) AS thumb_url
    FROM products p
    JOIN categories c ON c.id=p.category_id
    WHERE ${where}
    ORDER BY ${order}
    LIMIT ? OFFSET ?`;
  const [rows] = await pool.query(sql, [...params, limitNum, offset]);
  res.json({
    success: true,
    data: rows,
    pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) || 1 },
  });
});

const brands = asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT DISTINCT brand FROM products ORDER BY brand');
  res.json({ success: true, brands: rows.map((r) => r.brand) });
});

const categories = asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT id, name, slug FROM categories ORDER BY name');
  res.json({ success: true, data: rows });
});

const getProduct = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const [prows] = await pool.query(
    `SELECT p.*, c.name AS category_name FROM products p
     JOIN categories c ON c.id=p.category_id WHERE p.id=?`,
    [id]
  );
  if (!prows.length) return res.status(404).json({ success: false, error: 'Product not found' });
  const [imgs] = await pool.query(
    'SELECT id, url, sort_order FROM product_images WHERE product_id=? ORDER BY sort_order',
    [id]
  );
  res.json({ success: true, product: prows[0], images: imgs });
});

const productWriteValidators = [
  body('name').trim().notEmpty(),
  body('brand').trim().notEmpty(),
  body('description').optional(),
  body('price').isFloat({ min: 0 }),
  body('category_id').isInt(),
  body('stock_quantity').isInt({ min: 0 }),
  body('popularity_score').optional().isInt({ min: 0 }),
];

const createProduct = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  const {
    name,
    brand,
    description,
    price,
    category_id,
    stock_quantity,
    popularity_score = 0,
    images = [],
  } = req.body;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [r] = await conn.query(
      `INSERT INTO products (category_id, brand, name, description, price, stock_quantity, rating_avg, popularity_score)
       VALUES (?,?,?,?,?,?,0,?)`,
      [category_id, brand, name, description || '', price, stock_quantity, popularity_score]
    );
    const pid = r.insertId;
    const list = Array.isArray(images) ? images : [];
    let sort = 0;
    for (const url of list) {
      if (url)
        await conn.query(
          'INSERT INTO product_images (product_id, url, sort_order) VALUES (?,?,?)',
          [pid, url, sort++]
        );
    }
    if (!list.length) {
      await conn.query(
        'INSERT INTO product_images (product_id, url, sort_order) VALUES (?,?,0)',
        [pid, '/assets/placeholder.svg']
      );
    }
    await conn.commit();
    res.status(201).json({ success: true, id: pid });
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

const updateProduct = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  const id = req.params.id;
  const {
    name,
    brand,
    description,
    price,
    category_id,
    stock_quantity,
    popularity_score,
    images,
  } = req.body;
  const [ex] = await pool.query('SELECT id FROM products WHERE id=?', [id]);
  if (!ex.length) return res.status(404).json({ success: false, error: 'Not found' });
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(
      `UPDATE products SET brand=?, name=?, description=?, price=?, category_id=?, stock_quantity=?,
       popularity_score=COALESCE(?, popularity_score) WHERE id=?`,
      [brand, name, description || '', price, category_id, stock_quantity, popularity_score ?? null, id]
    );
    if (Array.isArray(images)) {
      await conn.query('DELETE FROM product_images WHERE product_id=?', [id]);
      let sort = 0;
      for (const url of images) {
        if (url)
          await conn.query(
            'INSERT INTO product_images (product_id, url, sort_order) VALUES (?,?,?)',
            [id, url, sort++]
          );
      }
    }
    await conn.commit();
    res.json({ success: true });
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

const deleteProduct = asyncHandler(async (req, res) => {
  const [r] = await pool.query('DELETE FROM products WHERE id=?', [req.params.id]);
  if (!r.affectedRows) return res.status(404).json({ success: false, error: 'Not found' });
  res.json({ success: true });
});

module.exports = {
  listProducts,
  getProduct,
  categories,
  brands,
  productWriteValidators,
  createProduct,
  updateProduct,
  deleteProduct,
  paramId: [param('id').isInt()],
};
