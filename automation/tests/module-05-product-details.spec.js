// @ts-check
const { test, expect } = require('@playwright/test');
const { resolveUrl } = require('../utils/base-url');
const { ProductPage } = require('../pom/ProductPage');
const { applyCustomerSession } = require('./session-helper');

test.describe('Module 05 — Product details (15 cases)', () => {
  test('TC-M05-01 Product page loads by id', async ({ page }) => {
    const p = new ProductPage(page);
    await p.openById(1);
    await expect(p.title).not.toHaveText('');
  });

  test('TC-M05-02 Brand visible', async ({ page }) => {
    const p = new ProductPage(page);
    await p.openById(1);
    await expect(p.brand).toBeVisible();
  });

  test('TC-M05-03 Price visible', async ({ page }) => {
    const p = new ProductPage(page);
    await p.openById(1);
    await expect(p.price).toContainText('$');
  });

  test('TC-M05-04 Stock line visible', async ({ page }) => {
    const p = new ProductPage(page);
    await p.openById(1);
    await expect(p.stock).toBeVisible();
  });

  test('TC-M05-05 Description visible', async ({ page }) => {
    const p = new ProductPage(page);
    await p.openById(1);
    await expect(p.desc).toBeVisible();
  });

  test('TC-M05-06 Main image visible', async ({ page }) => {
    const p = new ProductPage(page);
    await p.openById(1);
    await expect(p.mainImg).toBeVisible();
  });

  test('TC-M05-07 Gallery has at least one thumb', async ({ page }) => {
    const p = new ProductPage(page);
    await p.openById(1);
    await expect(p.gallery.first()).toBeVisible();
  });

  test('TC-M05-08 Qty defaults to 1', async ({ page }) => {
    const p = new ProductPage(page);
    await p.openById(1);
    await expect(p.qty).toHaveValue('1');
  });

  test('TC-M05-09 Add to cart button visible', async ({ page }) => {
    const p = new ProductPage(page);
    await p.openById(1);
    await expect(p.btnAddCart).toBeVisible();
  });

  test('TC-M05-10 Reviews section visible', async ({ page }) => {
    const p = new ProductPage(page);
    await p.openById(1);
    await expect(page.getByRole('heading', { name: /Reviews/i })).toBeVisible();
  });

  test('TC-M05-11 API product detail 200', async ({ request }) => {
    const res = await request.get(resolveUrl('/api/products/1'));
    expect(res.ok()).toBeTruthy();
  });

  test('TC-M05-12 API product 404', async ({ request }) => {
    const res = await request.get(resolveUrl('/api/products/999999'));
    expect(res.status()).toBe(404);
  });

  test('TC-M05-13 Guest clicking add redirects to login', async ({ page }) => {
    const p = new ProductPage(page);
    await p.openById(2);
    await p.btnAddCart.click();
    await expect(page).toHaveURL(/Login\.html/);
  });

  test('TC-M05-14 Authenticated add shows success', async ({ page, request }) => {
    await applyCustomerSession(page, request);
    const p = new ProductPage(page);
    await p.openById(3);
    await p.btnAddCart.click();
    await expect(p.alert).toContainText(/Added/i);
  });

  test('TC-M05-15 Reviews list API', async ({ request }) => {
    const res = await request.get(resolveUrl('/api/reviews/product/1'));
    expect(res.ok()).toBeTruthy();
  });
});
