const { BasePage } = require('./BasePage');

/** Module 06 — Shopping cart */
class CartPage extends BasePage {
  constructor(page) {
    super(page);
    this.rows = page.locator('#rows tr');
    this.subtotal = page.locator('#sub');
    this.checkoutLink = page.locator('#chk');
    this.alert = page.locator('#alert');
  }

  async open() {
    await this.goto('/Cart.html');
  }

  qtyInput(lineIndex) {
    return this.page.locator('.q').nth(lineIndex);
  }

  removeButton(lineIndex) {
    return this.page.locator('.rm').nth(lineIndex);
  }
}

module.exports = { CartPage };
