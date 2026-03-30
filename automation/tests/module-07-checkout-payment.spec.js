// @ts-check
const { test, expect } = require('@playwright/test');
const { resolveUrl } = require('../utils/base-url');
const { CheckoutPage } = require('../pom/CheckoutPage');
const { ProductPage } = require('../pom/ProductPage');
const { applyCustomerSession } = require('./session-helper');

test.describe('Module 07 — Checkout & payment (15 cases)', () => {
  test.describe.configure({ mode: 'serial' });
  test.beforeEach(async ({ page, request }) => {
    await applyCustomerSession(page, request);
    const pr = new ProductPage(page);
    await pr.openById(2);
    await pr.btnAddCart.click();
  });

  test('TC-M07-01 Checkout page loads', async ({ page }) => {
    const co = new CheckoutPage(page);
    await co.open();
    await expect(page).toHaveTitle(/Checkout/i);
  });

  test('TC-M07-02 Address fields visible', async ({ page }) => {
    const co = new CheckoutPage(page);
    await co.open();
    await expect(co.shippingName).toBeVisible();
    await expect(co.shippingLine1).toBeVisible();
  });

  test('TC-M07-03 Place order creates payment panel', async ({ page }) => {
    const co = new CheckoutPage(page);
    await co.open();
    await co.fillAddress();
    await co.btnPlace.click();
    await expect(co.payPanel).toBeVisible();
  });

  test('TC-M07-04 Valid credit card pays', async ({ page }) => {
    const co = new CheckoutPage(page);
    await co.open();
    await co.fillAddress();
    await co.btnPlace.click();
    await co.holder.fill('Pay Test');
    await co.pan.fill('4242424242424242');
    await co.expiry.fill('12/30');
    await co.cvv.fill('123');
    await co.btnPay.click();
    await expect(co.alert).toContainText(/successful/i);
  });

  test('TC-M07-05 Invalid PAN shows client error', async ({ page }) => {
    const co = new CheckoutPage(page);
    await co.open();
    await co.fillAddress();
    await co.btnPlace.click();
    await co.holder.fill('Pay Test');
    await co.pan.fill('1234567890123456');
    await co.expiry.fill('12/30');
    await co.cvv.fill('123');
    await co.btnPay.click();
    await expect(co.alert).toContainText(/Invalid|checksum|card/i);
  });

  test('TC-M07-06 Insufficient funds PAN', async ({ page }) => {
    const co = new CheckoutPage(page);
    await co.open();
    await co.fillAddress();
    await co.btnPlace.click();
    await co.holder.fill('Pay Test');
    await co.pan.fill('4000000000000002');
    await co.expiry.fill('12/30');
    await co.cvv.fill('123');
    await co.btnPay.click();
    await expect(co.alert).toContainText(/Insufficient/i);
  });

  test('TC-M07-07 UPI invalid domain', async ({ page }) => {
    const co = new CheckoutPage(page);
    await co.open();
    await co.fillAddress();
    await co.btnPlace.click();
    await co.payMethod.selectOption('upi');
    await co.upi.fill('bad@gmail.com');
    await co.btnPay.click();
    await expect(co.alert).toContainText(/UPI/i);
  });

  test('TC-M07-08 UPI valid pays', async ({ page }) => {
    const co = new CheckoutPage(page);
    await co.open();
    await co.fillAddress();
    await co.btnPlace.click();
    await co.payMethod.selectOption('upi');
    await co.upi.fill('automation.user@ybl');
    await co.btnPay.click();
    await expect(co.alert).toContainText(/successful/i);
  });

  test('TC-M07-09 Payment method select has card/upi', async ({ page }) => {
    const co = new CheckoutPage(page);
    await co.open();
    await co.fillAddress();
    await co.btnPlace.click();
    await expect(co.payMethod.locator('option')).toHaveCount(3);
  });

  test('TC-M07-10 City required in form', async ({ page }) => {
    const co = new CheckoutPage(page);
    await co.open();
    await expect(co.shippingCity).toHaveAttribute('required', '');
  });

  test('TC-M07-11 Postal required', async ({ page }) => {
    const co = new CheckoutPage(page);
    await co.open();
    await expect(co.shippingPostal).toHaveAttribute('required', '');
  });

  test('TC-M07-12 API payment 401 if not authed', async ({ request }) => {
    const res = await request.post(resolveUrl('/api/payments/process'), {
      data: { order_id: 1, method: 'upi', upi_id: 'x@ybl' },
      headers: { 'Content-Type': 'application/json' },
    });
    expect(res.status()).toBe(401);
  });

  test('TC-M07-13 Debit card method selectable', async ({ page }) => {
    const co = new CheckoutPage(page);
    await co.open();
    await co.fillAddress();
    await co.btnPlace.click();
    await co.payMethod.selectOption('debit_card');
    await expect(co.payMethod).toHaveValue('debit_card');
  });

  test('TC-M07-14 Holder required for UX', async ({ page }) => {
    const co = new CheckoutPage(page);
    await co.open();
    await co.fillAddress();
    await co.btnPlace.click();
    await expect(co.holder).toBeVisible();
  });

  test('TC-M07-15 Orders link in success message area after UPI pay', async ({ page }) => {
    const co = new CheckoutPage(page);
    await co.open();
    await co.fillAddress();
    await co.btnPlace.click();
    await co.payMethod.selectOption('upi');
    await co.upi.fill('pay2@oksbi');
    await co.btnPay.click();
    await expect(co.alert).toContainText(/Orders|successful/i);
  });
});
