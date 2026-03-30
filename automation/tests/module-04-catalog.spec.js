// @ts-check
const { test, expect } = require('@playwright/test');
const { resolveUrl } = require('../utils/base-url');
const { HomePage } = require('../pom/HomePage');

test.describe('Module 04 — Catalog / Home (15 cases)', () => {
  test('TC-M04-01 Home loads', async ({ page }) => {
    const h = new HomePage(page);
    await h.open();
    await expect(page).toHaveTitle(/Home/i);
  });

  test('TC-M04-02 Product grid visible', async ({ page }) => {
    const h = new HomePage(page);
    await h.open();
    await expect(h.productGrid).toBeVisible();
  });

  test('TC-M04-03 Toolbar filters visible', async ({ page }) => {
    const h = new HomePage(page);
    await h.open();
    await expect(h.category).toBeVisible();
    await expect(h.brand).toBeVisible();
  });

  test('TC-M04-04 Apply filters button visible', async ({ page }) => {
    const h = new HomePage(page);
    await h.open();
    await expect(h.btnApply).toBeVisible();
  });

  test('TC-M04-05 Search submits to Home with query', async ({ page }) => {
    const h = new HomePage(page);
    await h.open();
    await h.search('Earbuds');
    await expect(page).toHaveURL(/q=Earbuds/);
  });

  test('TC-M04-06 Apply filters loads cards', async ({ page }) => {
    const h = new HomePage(page);
    await h.open();
    await h.applyFilters();
    await expect(h.productGrid.locator('.card').first()).toBeVisible({ timeout: 20000 });
  });

  test('TC-M04-07 Sort select has options', async ({ page }) => {
    const h = new HomePage(page);
    await h.open();
    await expect(h.sort.locator('option')).toHaveCount(6);
  });

  test('TC-M04-08 Category select has All', async ({ page }) => {
    const h = new HomePage(page);
    await h.open();
    await expect(h.category.locator('option').first()).toHaveText(/All/i);
  });

  test('TC-M04-09 In-stock filter exists', async ({ page }) => {
    const h = new HomePage(page);
    await h.open();
    await expect(h.inStock).toBeVisible();
  });

  test('TC-M04-10 Min price input', async ({ page }) => {
    const h = new HomePage(page);
    await h.open();
    await h.minPrice.fill('10');
    await h.applyFilters();
    await expect(h.productGrid).toBeVisible();
  });

  test('TC-M04-11 Max price input', async ({ page }) => {
    const h = new HomePage(page);
    await h.open();
    await h.maxPrice.fill('500');
    await h.applyFilters();
    await expect(h.productGrid).toBeVisible();
  });

  test('TC-M04-12 Min rating input', async ({ page }) => {
    const h = new HomePage(page);
    await h.open();
    await h.minRating.fill('4');
    await h.applyFilters();
    await expect(h.minRating).toHaveValue('4');
    await expect(h.loading).toBeHidden();
  });

  test('TC-M04-13 API products list 200', async ({ request }) => {
    const res = await request.get(resolveUrl('/api/products?limit=5'));
    expect(res.ok()).toBeTruthy();
  });

  test('TC-M04-14 API categories meta', async ({ request }) => {
    const res = await request.get(resolveUrl('/api/products/meta/categories'));
    expect(res.ok()).toBeTruthy();
  });

  test('TC-M04-15 API brands meta', async ({ request }) => {
    const res = await request.get(resolveUrl('/api/products/meta/brands'));
    expect(res.ok()).toBeTruthy();
  });
});
