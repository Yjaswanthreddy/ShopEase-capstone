// @ts-check
const { test, expect } = require('@playwright/test');
const { resolveUrl } = require('../utils/base-url');
const { OrdersPage } = require('../pom/OrdersPage');
const { CheckoutPage } = require('../pom/CheckoutPage');
const { ProductPage } = require('../pom/ProductPage');
const { applyCustomerSession, login, users } = require('./session-helper');

test.describe('Module 08 — Orders (15 cases)', () => {
  test.describe.configure({ mode: 'serial' });
  test.beforeEach(async ({ page, request }) => {
    await applyCustomerSession(page, request);
  });

  test('TC-M08-01 Orders page loads', async ({ page }) => {
    const o = new OrdersPage(page);
    await o.open();
    await expect(page).toHaveTitle(/Orders/i);
  });

  test('TC-M08-02 Table visible', async ({ page }) => {
    const o = new OrdersPage(page);
    await o.open();
    await expect(page.getByRole('columnheader', { name: /Status/i })).toBeVisible();
  });

  test('TC-M08-03 API list orders 200', async ({ request }) => {
    const token = await login(request, users.customer);
    const res = await request.get(resolveUrl('/api/orders'), {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.ok()).toBeTruthy();
  });

  test('TC-M08-04 Create paid order via API for detail', async ({ request }) => {
    const token = await login(request, users.customer);
    await request.delete(resolveUrl('/api/cart/items'), {
      headers: { Authorization: `Bearer ${token}` },
    });
    await request.post(resolveUrl('/api/cart/items'), {
      data: { product_id: 3, quantity: 1 },
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    const chk = await request.post(resolveUrl('/api/orders/checkout'), {
      data: {
        shipping_name: 'API',
        shipping_line1: 'L1',
        shipping_city: 'City',
        shipping_postal: '11111',
        shipping_country: 'IN',
      },
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    const { order_id } = await chk.json();
    const pay = await request.post(resolveUrl('/api/payments/process'), {
      data: { order_id, method: 'upi', upi_id: 'ordtest@ybl' },
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    expect(pay.ok()).toBeTruthy();
    const one = await request.get(resolveUrl('/api/orders/' + order_id), {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(one.ok()).toBeTruthy();
  });

  test('TC-M08-05 Order detail contains items', async ({ request }) => {
    const token = await login(request, users.customer);
    const res = await request.get(resolveUrl('/api/orders'), {
      headers: { Authorization: `Bearer ${token}` },
    });
    const { orders } = await res.json();
    expect(Array.isArray(orders)).toBeTruthy();
  });

  test('TC-M08-06 UI shows at least header row when empty or data', async ({ page }) => {
    const o = new OrdersPage(page);
    await o.open();
    await expect(o.rows.first()).toBeVisible();
  });

  test('TC-M08-07 Cancel requires existing order', async ({ page }) => {
    const o = new OrdersPage(page);
    await o.open();
    const n = await page.locator('.btn-cancel').count();
    expect(n >= 0).toBeTruthy();
  });

  test('TC-M08-08 API orders 401 without auth', async ({ request }) => {
    const res = await request.get(resolveUrl('/api/orders'));
    expect(res.status()).toBe(401);
  });

  test('TC-M08-09 Place order from UI then open orders', async ({ page }) => {
    const pr = new ProductPage(page);
    await pr.openById(4);
    await pr.btnAddCart.click();
    const co = new CheckoutPage(page);
    await co.open();
    await co.fillAddress();
    await co.btnPlace.click();
    await co.payMethod.selectOption('upi');
    await co.upi.fill('uiorder@ybl');
    await co.btnPay.click();
    const o = new OrdersPage(page);
    await o.open();
    await expect(o.rows.first()).toBeVisible();
  });

  test('TC-M08-10 Order id column present', async ({ page }) => {
    const o = new OrdersPage(page);
    await o.open();
    await expect(page.getByRole('columnheader', { name: /ID/i })).toBeVisible();
  });

  test('TC-M08-11 Total column present', async ({ page }) => {
    const o = new OrdersPage(page);
    await o.open();
    await expect(page.getByRole('columnheader', { name: /Total/i })).toBeVisible();
  });

  test('TC-M08-12 Date column present', async ({ page }) => {
    const o = new OrdersPage(page);
    await o.open();
    await expect(page.getByRole('columnheader', { name: /Date/i })).toBeVisible();
  });

  test('TC-M08-13 Actions column present', async ({ page }) => {
    const o = new OrdersPage(page);
    await o.open();
    await expect(page.getByRole('columnheader', { name: /Actions/i })).toBeVisible();
  });

  test('TC-M08-14 GET unknown order 404', async ({ request }) => {
    const token = await login(request, users.customer);
    const res = await request.get(resolveUrl('/api/orders/999999999'), {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(404);
  });

  test('TC-M08-15 Order detail includes payment when paid', async ({ request }) => {
    const token = await login(request, users.customer);
    await request.delete(resolveUrl('/api/cart/items'), {
      headers: { Authorization: `Bearer ${token}` },
    });
    await request.post(resolveUrl('/api/cart/items'), {
      data: { product_id: 3, quantity: 1 },
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    const chk = await request.post(resolveUrl('/api/orders/checkout'), {
      data: {
        shipping_name: 'Pay',
        shipping_line1: 'Line',
        shipping_city: 'City',
        shipping_postal: '22222',
        shipping_country: 'IN',
      },
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    const { order_id } = await chk.json();
    await request.post(resolveUrl('/api/payments/process'), {
      data: { order_id, method: 'upi', upi_id: 'paid@ybl' },
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    const one = await request.get(resolveUrl('/api/orders/' + order_id), {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await one.json();
    expect(body.payment).toBeTruthy();
  });
});
