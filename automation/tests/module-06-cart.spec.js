// @ts-check
const { test, expect } = require('@playwright/test');
const { resolveUrl } = require('../utils/base-url');
const { CartPage } = require('../pom/CartPage');
const { ProductPage } = require('../pom/ProductPage');
const { applyCustomerSession, login, clearCart, users } = require('./session-helper');

test.describe('Module 06 — Cart (15 cases)', () => {
  test.describe.configure({ mode: 'serial' });
  test.beforeEach(async ({ page, request }) => {
    await applyCustomerSession(page, request);
  });

  test('TC-M06-01 Cart page loads', async ({ page }) => {
    const c = new CartPage(page);
    await c.open();
    await expect(page).toHaveTitle(/Cart/i);
  });

  test('TC-M06-02 Empty cart shows empty message', async ({ page }) => {
    const c = new CartPage(page);
    await c.open();
    await expect(c.rows.first()).toContainText(/empty/i);
  });

  test('TC-M06-03 Subtotal zero when empty', async ({ page }) => {
    const c = new CartPage(page);
    await c.open();
    await expect(c.subtotal).toContainText('0.00');
  });

  test('TC-M06-04 Add item shows row', async ({ page }) => {
    const pr = new ProductPage(page);
    await pr.openById(1);
    await pr.btnAddCart.click();
    const c = new CartPage(page);
    await c.open();
    await expect(c.rows.first()).not.toContainText(/empty/i);
  });

  test('TC-M06-05 Line shows product name', async ({ page }) => {
    const pr = new ProductPage(page);
    await pr.openById(2);
    await pr.btnAddCart.click();
    const c = new CartPage(page);
    await c.open();
    await expect(c.rows.first()).toBeVisible();
  });

  test('TC-M06-06 Update quantity changes subtotal', async ({ page }) => {
    const pr = new ProductPage(page);
    await pr.openById(4);
    await pr.btnAddCart.click();
    const c = new CartPage(page);
    await c.open();
    await c.qtyInput(0).fill('2');
    await c.qtyInput(0).dispatchEvent('change');
    await expect(c.subtotal).not.toContainText('0.00');
  });

  test('TC-M06-07 Remove line empties cart', async ({ page }) => {
    const pr = new ProductPage(page);
    await pr.openById(5);
    await pr.btnAddCart.click();
    const c = new CartPage(page);
    await c.open();
    await c.removeButton(0).click();
    await expect(c.rows.first()).toContainText(/empty/i);
  });

  test('TC-M06-08 Checkout link hidden when empty', async ({ page }) => {
    const c = new CartPage(page);
    await c.open();
    await expect(c.checkoutLink).toBeHidden();
  });

  test('TC-M06-09 Checkout link visible with items', async ({ page }) => {
    const pr = new ProductPage(page);
    await pr.openById(6);
    await pr.btnAddCart.click();
    const c = new CartPage(page);
    await c.open();
    await expect(c.checkoutLink).toBeVisible();
  });

  test('TC-M06-10 API cart returns items after add', async ({ request }) => {
    const token = await login(request, users.customer);
    await clearCart(request, token);
    const add = await request.post(resolveUrl('/api/cart/items'), {
      data: { product_id: 7, quantity: 1 },
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    expect(add.ok()).toBeTruthy();
    const res = await request.get(resolveUrl('/api/cart'), {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await res.json();
    expect(body.items.length).toBeGreaterThanOrEqual(1);
  });

  test('TC-M06-11 Cart table headers', async ({ page }) => {
    const c = new CartPage(page);
    await c.open();
    await expect(page.getByRole('columnheader', { name: /Product/i })).toBeVisible();
  });

  test('TC-M06-12 Second add merges quantity', async ({ page }) => {
    const pr = new ProductPage(page);
    await pr.openById(1);
    await pr.btnAddCart.click();
    await pr.openById(1);
    await pr.btnAddCart.click();
    const c = new CartPage(page);
    await c.open();
    await expect(c.qtyInput(0)).toHaveValue('2');
  });

  test('TC-M06-13 Cart accessible from nav', async ({ page }) => {
    await page.goto(resolveUrl('/Home.html'));
    await page.getByRole('link', { name: /Cart/i }).click();
    await expect(page).toHaveURL(/Cart\.html/);
  });

  test('TC-M06-14 API POST cart without token returns 401', async ({ request }) => {
    const res = await request.post(resolveUrl('/api/cart/items'), {
      data: { product_id: 1, quantity: 1 },
      headers: { 'Content-Type': 'application/json' },
    });
    expect(res.status()).toBe(401);
  });

  test('TC-M06-15 API GET cart without token returns 401', async ({ request }) => {
    const res = await request.get(resolveUrl('/api/cart'));
    expect(res.status()).toBe(401);
  });
});
