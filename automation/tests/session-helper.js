/**
 * API helpers for test setup (automation only).
 * Lives next to *.spec.js so copying `automation/tests/` always includes this file.
 * Uses absolute URLs so API calls work even if Playwright baseURL is not applied.
 */
const path = require('path');
const { resolveUrl } = require('../utils/base-url');
const users = require(path.join(__dirname, '../fixtures/users.json'));

/**
 * @param {import('@playwright/test').APIRequestContext} request
 * @param {{ email: string; password: string }} creds
 */
async function login(request, creds) {
  const res = await request.post(resolveUrl('/api/auth/login'), {
    data: { email: creds.email, password: creds.password },
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok()) {
    const t = await res.text();
    throw new Error(`Login failed ${res.status()}: ${t}`);
  }
  const body = await res.json();
  return body.token;
}

async function clearCart(request, token) {
  const res = await request.delete(resolveUrl('/api/cart/items'), {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok() && res.status() !== 401) {
    const t = await res.text();
    throw new Error(`clearCart failed ${res.status()}: ${t}`);
  }
}

async function loginCustomerAndClearCart(request) {
  const token = await login(request, users.customer);
  await clearCart(request, token);
  return token;
}

async function loginAdmin(request) {
  return login(request, users.admin);
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {import('@playwright/test').APIRequestContext} request
 */
async function applyCustomerSession(page, request) {
  const token = await login(request, users.customer);
  await clearCart(request, token);
  const me = await request.get(resolveUrl('/api/auth/me'), {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await me.json();
  const user = body.user;
  await page.addInitScript(
    ([tok, u]) => {
      localStorage.setItem('shopease_token', tok);
      localStorage.setItem('shopease_user', JSON.stringify(u));
    },
    [token, user]
  );
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {import('@playwright/test').APIRequestContext} request
 */
async function applyAdminSession(page, request) {
  const token = await login(request, users.admin);
  const me = await request.get(resolveUrl('/api/auth/me'), {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await me.json();
  const user = body.user;
  await page.addInitScript(
    ([tok, u]) => {
      localStorage.setItem('shopease_token', tok);
      localStorage.setItem('shopease_user', JSON.stringify(u));
    },
    [token, user]
  );
}

module.exports = {
  login,
  clearCart,
  loginCustomerAndClearCart,
  loginAdmin,
  applyCustomerSession,
  applyAdminSession,
  users,
};
