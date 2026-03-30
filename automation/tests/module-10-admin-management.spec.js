// @ts-check
const { test, expect } = require('@playwright/test');
const { resolveUrl } = require('../utils/base-url');
const { AdminManagementPage } = require('../pom/AdminManagementPage');
const { applyAdminSession, login, users } = require('./session-helper');

test.describe('Module 10 — Admin management (15 cases)', () => {
  test.beforeEach(async ({ page, request }) => {
    await applyAdminSession(page, request);
  });

  test('TC-M10-01 Products page loads', async ({ page }) => {
    const m = new AdminManagementPage(page);
    await m.openProducts();
    await expect(page).toHaveTitle(/Products/i);
  });

  test('TC-M10-02 Add product form visible', async ({ page }) => {
    const m = new AdminManagementPage(page);
    await m.openProducts();
    await expect(m.productForm).toBeVisible();
  });

  test('TC-M10-03 Create product success', async ({ page }) => {
    const m = new AdminManagementPage(page);
    await m.openProducts();
    const name = 'POM SKU ' + Date.now();
    await m.productName.fill(name);
    await m.productBrand.fill('POM Brand');
    await m.productCategoryId.fill('1');
    await m.productPrice.fill('12.34');
    await m.productStock.fill('20');
    await m.productSubmit.click();
    await expect(m.productsAlert).toContainText(/created/i);
    await expect(m.productRows.filter({ hasText: name }).first()).toBeVisible();
  });

  test('TC-M10-04 Products table has rows', async ({ page }) => {
    const m = new AdminManagementPage(page);
    await m.openProducts();
    await expect(m.productRows.first()).toBeVisible();
  });

  test('TC-M10-05 Orders admin page loads', async ({ page }) => {
    const m = new AdminManagementPage(page);
    await m.openOrders();
    await expect(page).toHaveTitle(/Orders/i);
  });

  test('TC-M10-06 Orders table visible', async ({ page }) => {
    const m = new AdminManagementPage(page);
    await m.openOrders();
    await expect(m.orderRows.first()).toBeVisible();
  });

  test('TC-M10-07 Users page loads', async ({ page }) => {
    const m = new AdminManagementPage(page);
    await m.openUsers();
    await expect(page).toHaveTitle(/Users/i);
  });

  test('TC-M10-08 Users table visible', async ({ page }) => {
    const m = new AdminManagementPage(page);
    await m.openUsers();
    await expect(m.userRows.first()).toBeVisible();
  });

  test('TC-M10-09 API admin orders list', async ({ request }) => {
    const token = await login(request, users.admin);
    const res = await request.get(resolveUrl('/api/orders/admin/all'), {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.ok()).toBeTruthy();
  });

  test('TC-M10-10 API admin users list', async ({ request }) => {
    const token = await login(request, users.admin);
    const res = await request.get(resolveUrl('/api/admin/users'), {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.ok()).toBeTruthy();
  });

  test('TC-M10-11 API create product', async ({ request }) => {
    const token = await login(request, users.admin);
    const res = await request.post(resolveUrl('/api/products'), {
      data: {
        name: 'API Product ' + Date.now(),
        brand: 'API',
        category_id: 1,
        price: 9.99,
        stock_quantity: 5,
        description: 'api',
        images: ['/assets/placeholder.svg'],
      },
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    expect(res.status()).toBe(201);
  });

  test('TC-M10-12 Customer cannot POST product', async ({ request }) => {
    const token = await login(request, users.customer);
    const res = await request.post(resolveUrl('/api/products'), {
      data: {
        name: 'X',
        brand: 'Y',
        category_id: 1,
        price: 1,
        stock_quantity: 1,
      },
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    expect(res.status()).toBe(403);
  });

  test('TC-M10-13 Orders page has status select', async ({ page }) => {
    const m = new AdminManagementPage(page);
    await m.openOrders();
    await expect(page.locator('select.st').first()).toBeVisible();
  });

  test('TC-M10-14 Users page has role select', async ({ page }) => {
    const m = new AdminManagementPage(page);
    await m.openUsers();
    await expect(page.locator('select.role').first()).toBeVisible();
  });

  test('TC-M10-15 Products page shows category column context', async ({ page }) => {
    const m = new AdminManagementPage(page);
    await m.openProducts();
    await expect(page.getByRole('columnheader', { name: /Stock/i })).toBeVisible();
  });
});
