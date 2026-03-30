const { BasePage } = require('./BasePage');

/** Module 08 — Orders */
class OrdersPage extends BasePage {
  constructor(page) {
    super(page);
    this.rows = page.locator('#rows tr');
    this.alert = page.locator('#alert');
  }

  async open() {
    await this.goto('/Orders.html');
  }

  cancelForRow(i) {
    return this.page.locator('.btn-cancel').nth(i);
  }

  returnForRow(i) {
    return this.page.locator('.btn-ret').nth(i);
  }

  refundForRow(i) {
    return this.page.locator('.btn-ref').nth(i);
  }
}

module.exports = { OrdersPage };
