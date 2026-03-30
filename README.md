# ShopEase — Full-Stack E-Commerce Capstone

Production-style demo application with **Node.js + Express**, **MySQL**, **vanilla HTML/CSS/JS** frontend, **STLC documentation**, **Playwright (JavaScript + POM)**, and **SQL validation** scripts.

## Folder layout

| Path | Purpose |
|------|---------|
| `frontend/` | Static UI (`Home.html`, `Login.html`, `Register.html`, `Product.html`, `Cart.html`, `Checkout.html`, `Orders.html`, `Forgot.html`, `Reset.html`, `admin/*`) |
| `backend/` | Express API (MVC-style: routes, controllers, services, middleware) |
| `database/` | `schema.sql`, `seed.js`, `validation_queries.sql` |
| `documentation/` | Test strategy, plan, scenarios, 120+ cases, data, execution & defect reports, metrics |
| `automation/` | `playwright.config.js`, `pom/`, `tests/`, `fixtures/`, `utils/`, HTML report output under `automation/reports/` |

## Prerequisites

- Node.js 18+
- MySQL 8.x (recommended)

## Setup

1. **Create database schema**

   ```bash
   mysql -u root -p < database/schema.sql
   ```

2. **Configure environment**

   ```bash
   cp .env.example .env
   # Edit DB_* and JWT_SECRET
   ```

3. **Install dependencies**

   ```bash
   npm install
   npx playwright install chromium
   ```

4. **Seed demo data** (creates categories, products with **multiple images**, admin + customer)

   ```bash
   npm run seed
   ```

   | Account | Email | Password |
   |---------|-------|----------|
   | Admin | `admin@shopease.test` | `Admin12345!` |
   | Customer | `customer@shopease.test` | `Customer123!` |

5. **Run API + UI**

   ```bash
   npm start
   ```

   Open [http://localhost:5000/Home.html](http://localhost:5000/Home.html) (root `/` redirects to `Home.html`). Port comes from `PORT` in `.env` (default **5000**).

## API overview

- **Auth:** `POST /api/auth/register`, `login`, `forgot-password`, `reset-password`, `GET /api/auth/me`
- **Catalog:** `GET /api/products` (search, category, brand, price, rating, in-stock, sort, pagination), `GET /api/products/:id`, meta routes for categories/brands
- **Cart:** `GET/POST/PATCH/DELETE /api/cart/...` (stock validated)
- **Orders:** `POST /api/orders/checkout`, `GET /api/orders`, `GET /api/orders/:id`, `POST .../cancel`, `POST .../return`, admin `GET /api/orders/admin/all`, `PATCH .../status`
- **Payments:** `POST /api/payments/process` (card/UPI validation + simulation), `POST /api/payments/refund/:orderId`
- **Reviews:** `GET /api/reviews/product/:productId`, `POST/PUT/DELETE /api/reviews`
- **Admin:** `GET /api/admin/dashboard`, `users`, `PATCH .../users/:id/role`

JWT: send `Authorization: Bearer <token>` (stored in `localStorage` as `shopease_token`).

## Payment simulation (QA)

| Scenario | Input |
|----------|--------|
| Success card (Luhn + rules) | e.g. `4242424242424242`, expiry `12/30`, CVV `123` |
| Insufficient funds | PAN `4000000000000002` |
| Invalid / failed Luhn | any invalid PAN |
| UPI valid suffix | `user@ybl`, `@upi`, `@oksbi`, `@okhdfc` |
| UPI invalid | e.g. `x@gmail.com` |
| UPI insufficient (simulated) | id starting with `nofunds.` |

## Database validation

Run queries in `database/validation_queries.sql` for cart totals, stock, order/payment consistency, and review aggregates.

## Automation

- **POM:** `automation/pom/` — 10 module page objects (+ `BasePage.js`). See `automation/ARCHITECTURE.md`.
- **Tests:** `automation/tests/module-01-*.spec.js` … `module-10-*.spec.js` — **15 test cases per module** (150 total).

```bash
# Ensure MySQL running, schema loaded, seed executed, then:
npm run test:e2e
npm run test:e2e:report
```

To use an already-running server:

```bash
SKIP_WEBSERVER=1 npm run test:e2e
```

If the app runs on another host/port, set the base URL (used for `page.goto` and API calls):

```bash
set PLAYWRIGHT_BASE_URL=http://127.0.0.1:5000
npm run test:e2e
```

(PowerShell: `$env:PLAYWRIGHT_BASE_URL="http://127.0.0.1:5000"`)

This must match the URL where ShopEase is running (same as `PORT` in `.env`).

## JWT secret

Set a strong `JWT_SECRET` in `.env` for any shared environment.
