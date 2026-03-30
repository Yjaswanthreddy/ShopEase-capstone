const { BasePage } = require('./BasePage');

/** Module 07 — Checkout & payment simulation */
class CheckoutPage extends BasePage {
  constructor(page) {
    super(page);
    this.shippingName = page.locator('input[name="shipping_name"]');
    this.shippingLine1 = page.locator('input[name="shipping_line1"]');
    this.shippingCity = page.locator('input[name="shipping_city"]');
    this.shippingPostal = page.locator('input[name="shipping_postal"]');
    this.btnPlace = page.locator('#btn-place');
    this.payPanel = page.locator('#pay-panel');
    this.payMethod = page.locator('#pay-method');
    this.pan = page.locator('#pan');
    this.expiry = page.locator('#expiry');
    this.cvv = page.locator('#cvv');
    this.holder = page.locator('#holder');
    this.upi = page.locator('#upi');
    this.btnPay = page.locator('#btn-pay');
    this.alert = page.locator('#alert');
  }

  async open() {
    await this.goto('/Checkout.html');
  }

  async fillAddress() {
    await this.shippingName.fill('QA Automation');
    await this.shippingLine1.fill('100 Test Lane');
    await this.shippingCity.fill('Bengaluru');
    await this.shippingPostal.fill('560001');
  }
}

module.exports = { CheckoutPage };
