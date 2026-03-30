// @ts-check
const { test, expect } = require('@playwright/test');
const { resolveUrl } = require('../utils/base-url');
const { PasswordRecoveryPage } = require('../pom/PasswordRecoveryPage');
const users = require('../fixtures/users.json');

test.describe('Module 03 — Password recovery (15 cases)', () => {
  test('TC-M03-01 Forgot page loads', async ({ page }) => {
    const p = new PasswordRecoveryPage(page);
    await p.openForgot();
    await expect(page).toHaveTitle(/Forgot/i);
  });

  test('TC-M03-02 Forgot email field visible', async ({ page }) => {
    const p = new PasswordRecoveryPage(page);
    await p.openForgot();
    await expect(p.forgotEmail).toBeVisible();
  });

  test('TC-M03-03 Forgot submit visible', async ({ page }) => {
    const p = new PasswordRecoveryPage(page);
    await p.openForgot();
    await expect(p.forgotSubmit).toBeVisible();
  });

  test('TC-M03-04 Forgot request for known user shows success message', async ({ page }) => {
    const p = new PasswordRecoveryPage(page);
    await p.openForgot();
    await p.requestReset(users.customer.email);
    await expect(p.forgotAlert).toContainText(/email|exists|recorded|instructions/i);
  });

  test('TC-M03-05 Forgot request for unknown email still generic message', async ({ page }) => {
    const p = new PasswordRecoveryPage(page);
    await p.openForgot();
    await p.requestReset('missing_' + Date.now() + '@example.com');
    await expect(p.forgotAlert).toContainText(/email|exists|recorded|instructions/i);
  });

  test('TC-M03-06 Back to login link works', async ({ page }) => {
    const p = new PasswordRecoveryPage(page);
    await p.openForgot();
    await page.getByRole('link', { name: /Back to login/i }).click();
    await expect(page).toHaveURL(/Login\.html/);
  });

  test('TC-M03-07 Reset page loads', async ({ page }) => {
    const p = new PasswordRecoveryPage(page);
    await p.openReset();
    await expect(page).toHaveURL(/Reset\.html/);
  });

  test('TC-M03-08 Reset token field visible', async ({ page }) => {
    const p = new PasswordRecoveryPage(page);
    await p.openReset();
    await expect(p.resetToken).toBeVisible();
  });

  test('TC-M03-09 Reset password field visible', async ({ page }) => {
    const p = new PasswordRecoveryPage(page);
    await p.openReset();
    await expect(p.resetPassword).toBeVisible();
  });

  test('TC-M03-10 Invalid token shows error on reset', async ({ page }) => {
    const p = new PasswordRecoveryPage(page);
    await p.openReset();
    await p.submitNewPassword('deadbeefnotatoken', 'NewPassword123!');
    await expect(p.resetAlert).toContainText(/Invalid|expired|error/i);
  });

  test('TC-M03-11 API forgot-password returns 200', async ({ request }) => {
    const res = await request.post(resolveUrl('/api/auth/forgot-password'), {
      data: { email: users.customer.email },
      headers: { 'Content-Type': 'application/json' },
    });
    expect(res.ok()).toBeTruthy();
  });

  test('TC-M03-12 API forgot invalid email format', async ({ request }) => {
    const res = await request.post(resolveUrl('/api/auth/forgot-password'), {
      data: { email: 'not-an-email' },
      headers: { 'Content-Type': 'application/json' },
    });
    expect(res.status()).toBe(400);
  });

  test('TC-M03-13 Forgot email input type email', async ({ page }) => {
    const p = new PasswordRecoveryPage(page);
    await p.openForgot();
    await expect(p.forgotEmail).toHaveAttribute('type', 'email');
  });

  test('TC-M03-14 Reset password minlength', async ({ page }) => {
    const p = new PasswordRecoveryPage(page);
    await p.openReset();
    await expect(p.resetPassword).toHaveAttribute('minlength', '8');
  });

  test('TC-M03-15 Dev token path: forgot may expose dev_reset_token in non-prod', async ({
    request,
  }) => {
    const res = await request.post(resolveUrl('/api/auth/forgot-password'), {
      data: { email: users.customer.email },
      headers: { 'Content-Type': 'application/json' },
    });
    const body = await res.json();
    expect(body).toHaveProperty('success', true);
  });
});
