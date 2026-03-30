// @ts-check
const { test, expect } = require('@playwright/test');
const { resolveUrl } = require('../utils/base-url');
const { LoginPage } = require('../pom/LoginPage');
const users = require('../fixtures/users.json');

test.describe('Module 01 — Login (15 cases)', () => {
  test('TC-M01-01 Login page loads', async ({ page }) => {
    const p = new LoginPage(page);
    await p.open();
    await expect(page).toHaveTitle(/Login/i);
  });

  test('TC-M01-02 Email field visible', async ({ page }) => {
    const p = new LoginPage(page);
    await p.open();
    await expect(p.email).toBeVisible();
  });

  test('TC-M01-03 Password field visible', async ({ page }) => {
    const p = new LoginPage(page);
    await p.open();
    await expect(p.password).toBeVisible();
  });

  test('TC-M01-04 Submit button visible', async ({ page }) => {
    const p = new LoginPage(page);
    await p.open();
    await expect(p.submit).toBeVisible();
  });

  test('TC-M01-05 Successful login redirects to Home', async ({ page }) => {
    const p = new LoginPage(page);
    await p.open();
    await p.login(users.customer.email, users.customer.password);
    await expect(page).toHaveURL(/Home\.html/);
  });

  test('TC-M01-06 Wrong password shows error', async ({ page }) => {
    const p = new LoginPage(page);
    await p.open();
    await p.login(users.customer.email, 'WrongPassword999!');
    await expect(p.alert).toContainText(/Invalid|password/i);
  });

  test('TC-M01-07 Unknown email shows error', async ({ page }) => {
    const p = new LoginPage(page);
    await p.open();
    await p.login('nouser_' + Date.now() + '@example.com', 'Password123!');
    await expect(p.alert).toContainText(/Invalid|password/i);
  });

  test('TC-M01-08 Admin can login', async ({ page }) => {
    const p = new LoginPage(page);
    await p.open();
    await p.login(users.admin.email, users.admin.password);
    await expect(page).toHaveURL(/Home\.html/);
  });

  test('TC-M01-09 Link to Register navigates', async ({ page }) => {
    const p = new LoginPage(page);
    await p.open();
    await p.linkRegister.click();
    await expect(page).toHaveURL(/Register\.html/);
  });

  test('TC-M01-10 Link to Forgot password navigates', async ({ page }) => {
    const p = new LoginPage(page);
    await p.open();
    await p.linkForgot.click();
    await expect(page).toHaveURL(/Forgot\.html/);
  });

  test('TC-M01-11 After login navbar shows Orders', async ({ page }) => {
    const p = new LoginPage(page);
    await p.open();
    await p.login(users.customer.email, users.customer.password);
    await expect(page.getByRole('link', { name: /Orders/i })).toBeVisible();
  });

  test('TC-M01-12 Logout returns to anonymous nav', async ({ page }) => {
    const p = new LoginPage(page);
    await p.open();
    await p.login(users.customer.email, users.customer.password);
    await page.getByRole('button', { name: /Logout/i }).click();
    await expect(page.getByRole('link', { name: /^Login$/i })).toBeVisible();
  });

  test('TC-M01-13 Email input type is email', async ({ page }) => {
    const p = new LoginPage(page);
    await p.open();
    await expect(p.email).toHaveAttribute('type', 'email');
  });

  test('TC-M01-14 Password input type is password', async ({ page }) => {
    const p = new LoginPage(page);
    await p.open();
    await expect(p.password).toHaveAttribute('type', 'password');
  });

  test('TC-M01-15 API login 401 on bad password', async ({ request }) => {
    const res = await request.post(resolveUrl('/api/auth/login'), {
      data: { email: users.customer.email, password: 'bad' },
      headers: { 'Content-Type': 'application/json' },
    });
    expect(res.status()).toBe(401);
  });
});
