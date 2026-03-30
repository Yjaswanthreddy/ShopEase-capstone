// @ts-check
const { test, expect } = require('@playwright/test');
const { resolveUrl } = require('../utils/base-url');
const { RegisterPage } = require('../pom/RegisterPage');

test.describe('Module 02 — Register (15 cases)', () => {
  test.describe.configure({ mode: 'serial' });
  const uniqueEmail = (n) => `reg_tc_${Date.now()}_${n}@example.com`;

  test('TC-M02-01 Register page loads', async ({ page }) => {
    const p = new RegisterPage(page);
    await p.open();
    await expect(page).toHaveTitle(/Register/i);
  });

  test('TC-M02-02 Name field visible', async ({ page }) => {
    const p = new RegisterPage(page);
    await p.open();
    await expect(p.name).toBeVisible();
  });

  test('TC-M02-03 Email field visible', async ({ page }) => {
    const p = new RegisterPage(page);
    await p.open();
    await expect(p.email).toBeVisible();
  });

  test('TC-M02-04 Password field visible', async ({ page }) => {
    const p = new RegisterPage(page);
    await p.open();
    await expect(p.password).toBeVisible();
  });

  test('TC-M02-05 Successful registration redirects Home', async ({ page }) => {
    const p = new RegisterPage(page);
    await p.open();
    await p.register('TC User', uniqueEmail(5), 'Password123!');
    await expect(page).toHaveURL(/Home\.html/);
  });

  test('TC-M02-06 Duplicate email shows error', async ({ page }) => {
    const p = new RegisterPage(page);
    await p.open();
    const email = uniqueEmail(6);
    await p.register('Alpha', email, 'Password123!');
    await expect(page).toHaveURL(/Home\.html/);
    await p.open();
    await p.register('Beta', email, 'Password123!');
    await expect(p.alert).toContainText(/already|registered|409/i);
  });

  test('TC-M02-07 Link to Login navigates', async ({ page }) => {
    const p = new RegisterPage(page);
    await p.open();
    await p.linkLogin.click();
    await expect(page).toHaveURL(/Login\.html/);
  });

  test('TC-M02-08 Password minlength attribute', async ({ page }) => {
    const p = new RegisterPage(page);
    await p.open();
    await expect(p.password).toHaveAttribute('minlength', '8');
  });

  test('TC-M02-09 Name required attribute', async ({ page }) => {
    const p = new RegisterPage(page);
    await p.open();
    await expect(p.name).toHaveAttribute('required', '');
  });

  test('TC-M02-10 Email required attribute', async ({ page }) => {
    const p = new RegisterPage(page);
    await p.open();
    await expect(p.email).toHaveAttribute('required', '');
  });

  test('TC-M02-11 API register conflict duplicate', async ({ request }) => {
    const email = uniqueEmail(11);
    const body = { name: 'X', email, password: 'Password123!' };
    const r1 = await request.post(resolveUrl('/api/auth/register'), {
      data: body,
      headers: { 'Content-Type': 'application/json' },
    });
    expect(r1.ok()).toBeTruthy();
    const r2 = await request.post(resolveUrl('/api/auth/register'), {
      data: body,
      headers: { 'Content-Type': 'application/json' },
    });
    expect(r2.status()).toBe(409);
  });

  test('TC-M02-12 API register weak password', async ({ request }) => {
    const res = await request.post(resolveUrl('/api/auth/register'), {
      data: { name: 'X', email: uniqueEmail(12), password: 'short' },
      headers: { 'Content-Type': 'application/json' },
    });
    expect(res.status()).toBe(400);
  });

  test('TC-M02-13 New user token works for /me', async ({ request }) => {
    const email = uniqueEmail(13);
    const res = await request.post(resolveUrl('/api/auth/register'), {
      data: { name: 'Me', email, password: 'Password123!' },
      headers: { 'Content-Type': 'application/json' },
    });
    const { token } = await res.json();
    const me = await request.get(resolveUrl('/api/auth/me'), {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(me.ok()).toBeTruthy();
  });

  test('TC-M02-14 Register form has submit', async ({ page }) => {
    const p = new RegisterPage(page);
    await p.open();
    await expect(p.submit).toBeEnabled();
  });

  test('TC-M02-15 Register page has heading', async ({ page }) => {
    const p = new RegisterPage(page);
    await p.open();
    await expect(page.getByRole('heading', { name: /Create account/i })).toBeVisible();
  });
});
