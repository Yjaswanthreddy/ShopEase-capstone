-- ShopEase Capstone — MySQL schema
CREATE DATABASE IF NOT EXISTS shopease CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE shopease;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(120) NOT NULL,
  role ENUM('customer','admin') NOT NULL DEFAULT 'customer',
  reset_token VARCHAR(64) NULL,
  reset_expires DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_users_email (email),
  KEY idx_users_reset (reset_token)
) ENGINE=InnoDB;

CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(120) NOT NULL,
  UNIQUE KEY uk_cat_slug (slug)
) ENGINE=InnoDB;

CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT NOT NULL,
  brand VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  rating_avg DECIMAL(3,2) NOT NULL DEFAULT 0,
  popularity_score INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_prod_category (category_id),
  KEY idx_prod_brand (brand),
  KEY idx_prod_price (price),
  KEY idx_prod_rating (rating_avg),
  KEY idx_prod_stock (stock_quantity),
  CONSTRAINT fk_prod_cat FOREIGN KEY (category_id) REFERENCES categories(id)
) ENGINE=InnoDB;

CREATE TABLE product_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  url VARCHAR(512) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  KEY idx_pi_product (product_id),
  CONSTRAINT fk_pi_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE cart (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_cart_user (user_id),
  CONSTRAINT fk_cart_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE cart_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cart_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL CHECK (quantity >= 1),
  UNIQUE KEY uk_cart_line (cart_id, product_id),
  KEY idx_ci_cart (cart_id),
  CONSTRAINT fk_ci_cart FOREIGN KEY (cart_id) REFERENCES cart(id) ON DELETE CASCADE,
  CONSTRAINT fk_ci_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  status ENUM(
    'pending_payment','paid','processing','shipped','delivered',
    'cancelled','return_requested','returned','refunded'
  ) NOT NULL DEFAULT 'pending_payment',
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  shipping_name VARCHAR(120) NOT NULL,
  shipping_line1 VARCHAR(255) NOT NULL,
  shipping_line2 VARCHAR(255) NULL,
  shipping_city VARCHAR(100) NOT NULL,
  shipping_postal VARCHAR(20) NOT NULL,
  shipping_country VARCHAR(100) NOT NULL DEFAULT 'IN',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_ord_user (user_id),
  KEY idx_ord_status (status),
  CONSTRAINT fk_ord_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL CHECK (quantity >= 1),
  unit_price DECIMAL(10,2) NOT NULL,
  KEY idx_oi_order (order_id),
  CONSTRAINT fk_oi_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_oi_product FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB;

CREATE TABLE payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  method ENUM('credit_card','debit_card','upi') NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  status ENUM('pending','completed','failed','refunded') NOT NULL DEFAULT 'pending',
  transaction_ref VARCHAR(64) NOT NULL,
  meta JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_pay_order (order_id),
  UNIQUE KEY uk_pay_txn (transaction_ref),
  CONSTRAINT fk_pay_order FOREIGN KEY (order_id) REFERENCES orders(id)
) ENGINE=InnoDB;

CREATE TABLE reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title VARCHAR(200) NULL,
  body TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_rev_user_product (user_id, product_id),
  KEY idx_rev_product (product_id),
  CONSTRAINT fk_rev_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_rev_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;
