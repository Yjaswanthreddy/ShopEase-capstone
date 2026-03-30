const { BasePage } = require('./BasePage');

/** Module 10 — Admin CRUD (products, orders, users) */
class AdminManagementPage extends BasePage {
  constructor(page) {
    super(page);
    // Products
    this.productForm = page.locator('#add');
    this.productName = page.locator('#add input[name="name"]');
    this.productBrand = page.locator('#add input[name="brand"]');
    this.productCategoryId = page.locator('#add input[name="category_id"]');
    this.productPrice = page.locator('#add input[name="price"]');
    this.productStock = page.locator('#add input[name="stock_quantity"]');
    this.productDesc = page.locator('#add textarea[name="description"]');
    this.productImages = page.locator('#add input[name="images"]');
    this.productSubmit = page.locator('#add button[type="submit"]');
    this.productRows = page.locator('#rows tr');
    this.productsAlert = page.locator('#alert');

    // Orders
    this.orderRows = page.locator('#rows tr');
    this.ordersAlert = page.locator('#alert');

    // Users
    this.userRows = page.locator('#rows tr');
    this.usersAlert = page.locator('#alert');
  }

  async openProducts() {
    await this.goto('/admin/Products.html');
  }

  async openOrders() {
    await this.goto('/admin/Orders.html');
  }

  async openUsers() {
    await this.goto('/admin/Users.html');
  }

  orderStatusSelect(row) {
    return row.locator('select.st');
  }

  orderSaveButton(row) {
    return row.locator('button.save');
  }

  userRoleSelect(row) {
    return row.locator('select.role');
  }

  userSaveButton(row) {
    return row.locator('button.sv');
  }
}

module.exports = { AdminManagementPage };
