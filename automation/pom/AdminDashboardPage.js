const { BasePage } = require('./BasePage');

/** Module 09 — Admin dashboard (metrics) */
class AdminDashboardPage extends BasePage {
  constructor(page) {
    super(page);
    this.countUsers = page.locator('#c-users');
    this.countProducts = page.locator('#c-products');
    this.countOrders = page.locator('#c-orders');
    this.netRevenue = page.locator('#c-rev');
    this.alert = page.locator('#alert');
  }

  async open() {
    await this.goto('/admin/Dashboard.html');
  }

  linkToProducts() {
    return this.page.getByRole('link', { name: /Manage products/i });
  }

  linkToOrders() {
    return this.page.getByRole('link', { name: /Manage orders/i });
  }

  linkToUsers() {
    return this.page.getByRole('link', { name: /Manage users/i });
  }
}

module.exports = { AdminDashboardPage };
