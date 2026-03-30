-- ShopEase — database validation / reconciliation queries (manual + automation reference)
USE shopease;

-- 1) CRUD sanity: latest products
SELECT id, brand, name, price, stock_quantity FROM products ORDER BY id DESC LIMIT 10;

-- 2) Cart total vs line sum (should match application subtotal)
SELECT c.user_id,
       SUM(ci.quantity * p.price) AS computed_subtotal
FROM cart c
JOIN cart_items ci ON ci.cart_id = c.id
JOIN products p ON p.id = ci.product_id
GROUP BY c.user_id;

-- 3) Stock non-negative
SELECT id, name, stock_quantity FROM products WHERE stock_quantity < 0;

-- 4) Order total vs order_items
SELECT o.id,
       o.total_amount AS stored_total,
       SUM(oi.quantity * oi.unit_price) AS computed_total
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
GROUP BY o.id, o.total_amount
HAVING ABS(stored_total - computed_total) > 0.01;

-- 5) Payment vs order amount consistency
SELECT o.id, o.total_amount, p.amount, p.status
FROM orders o
JOIN payments p ON p.order_id = o.id
WHERE ABS(o.total_amount - p.amount) > 0.01;

-- 6) Reviews aggregation vs product.rating_avg (spot check)
SELECT p.id,
       p.rating_avg AS stored_avg,
       ROUND(AVG(r.rating), 2) AS computed_avg
FROM products p
LEFT JOIN reviews r ON r.product_id = p.id
GROUP BY p.id, p.rating_avg
HAVING stored_avg IS NOT NULL AND ABS(stored_avg - computed_avg) > 0.05;

-- 7) Orphan cart items (should be empty)
SELECT ci.* FROM cart_items ci
LEFT JOIN cart c ON c.id = ci.cart_id
WHERE c.id IS NULL;

-- 8) Completed payments without paid-like order state
SELECT p.order_id, o.status, p.status
FROM payments p
JOIN orders o ON o.id = p.order_id
WHERE p.status = 'completed' AND o.status IN ('cancelled', 'refunded');
