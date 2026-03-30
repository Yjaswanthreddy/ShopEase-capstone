const { BasePage } = require('./BasePage');

/** Module 04 — Product catalog (Home) */
class HomePage extends BasePage {
  constructor(page) {
    super(page);
    this.searchInput = page.locator('.search-bar input[type="search"]');
    this.searchForm = page.locator('.search-bar');
    this.category = page.locator('#f-category');
    this.brand = page.locator('#f-brand');
    this.minPrice = page.locator('#f-min');
    this.maxPrice = page.locator('#f-max');
    this.minRating = page.locator('#f-rating');
    this.inStock = page.locator('#f-stock');
    this.sort = page.locator('#f-sort');
    this.btnApply = page.locator('#btn-apply');
    this.btnMore = page.locator('#btn-more');
    this.productGrid = page.locator('#product-grid');
    this.loading = page.locator('#loading');
    this.alert = page.locator('#alert');
  }

  async open() {
    await this.goto('/Home.html');
  }

  async search(text) {
    await this.searchInput.fill(text);
    await this.searchInput.press('Enter');
  }

  async applyFilters() {
    await this.btnApply.click();
  }
}

module.exports = { HomePage };
