// @ts-check
const { test, expect } = require('@playwright/test');
const { resolveUrl } = require('../utils/base-url');
const { AdminDashboardPage } = require('../pom/AdminDashboardPage');
const { applyAdminSession, login, users } = require('./session-helper');

test.describe('Module 09 — Admin dashboard (15 cases)', () => {
  test.beforeEach(async ({ page, request }) => {
    await applyAdminSession(page, request);
  });

  test('TC-M09-01 Dashboard loads', async ({ page }) => {
    const a = new AdminDashboardPage(page);
    await a.open();
    await expect(page).toHaveTitle(/Admin/i);
  });

  test('TC-M09-02 Users metric visible', async ({ page }) => {
    const a = new AdminDashboardPage(page);
    await a.open();
    await expect(a.countUsers).not.toHaveText('—', { timeout: 15000 });
  });

  test('TC-M09-03 Products metric visible', async ({ page }) => {
    const a = new AdminDashboardPage(page);
    await a.open();
    await expect(a.countProducts).not.toHaveText('—', { timeout: 15000 });
  });

  test('TC-M09-04 Orders metric visible', async ({ page }) => {
    const a = new AdminDashboardPage(page);
    await a.open();
    await expect(a.countOrders).not.toHaveText('—', { timeout: 15000 });
  });

  test('TC-M09-05 Net revenue visible', async ({ page }) => {
    const a = new AdminDashboardPage(page);
    await a.open();
    await expect(a.netRevenue).toContainText(/\$|net/i);
  });

  test('TC-M09-06 Link to products works', async ({ page }) => {
    const a = new AdminDashboardPage(page);
    await a.open();
    await a.linkToProducts().click();
    await expect(page).toHaveURL(/Products\.html/);
  });

  test('TC-M09-07 Link to orders works', async ({ page }) => {
    const a = new AdminDashboardPage(page);
    await a.open();
    await a.linkToOrders().click();
    await expect(page).toHaveURL(/Orders\.html/);
  });

  test('TC-M09-08 Link to users works', async ({ page }) => {
    const a = new AdminDashboardPage(page);
    await a.open();
    await a.linkToUsers().click();
    await expect(page).toHaveURL(/Users\.html/);
  });

  test('TC-M09-09 API dashboard 200', async ({ request }) => {
    const token = await login(request, users.admin);
    const res = await request.get(resolveUrl('/api/admin/dashboard'), {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.ok()).toBeTruthy();
  });

  test('TC-M09-10 API dashboard 403 for customer', async ({ request }) => {
    const token = await login(request, users.customer);
    const res = await request.get(resolveUrl('/api/admin/dashboard'), {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(403);
  });

  test('TC-M09-11 Dashboard heading visible', async ({ page }) => {
    const a = new AdminDashboardPage(page);
    await a.open();
    await expect(page.getByRole('heading', { name: /Admin dashboard/i })).toBeVisible();
  });

  test('TC-M09-12 Metrics cards count', async ({ page }) => {
    const a = new AdminDashboardPage(page);
    await a.open();
    await expect(page.locator('.card')).toHaveCount(4);
  });

  test('TC-M09-13 Footer visible', async ({ page }) => {
    const a = new AdminDashboardPage(page);
    await a.open();
    await expect(page.locator('.site-footer')).toBeVisible();
  });

  test('TC-M09-14 Header nav visible', async ({ page }) => {
    const a = new AdminDashboardPage(page);
    await a.open();
    await expect(page.locator('.site-header')).toBeVisible();
  });

  test('TC-M09-15 Response JSON has revenue keys', async ({ request }) => {
    const token = await login(request, users.admin);
    const res = await request.get(resolveUrl('/api/admin/dashboard'), {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await res.json();
    expect(body.revenue).toBeTruthy();
    expect(body.counts).toBeTruthy();
  });
});
