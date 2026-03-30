const { BasePage } = require('./BasePage');

/** Module 05 — Product details */
class ProductPage extends BasePage {
  constructor(page) {
    super(page);
    this.title = page.locator('#title');
    this.brand = page.locator('#brand');
    this.price = page.locator('#price');
    this.stock = page.locator('#stock');
    this.desc = page.locator('#desc');
    this.mainImg = page.locator('#main-img');
    this.gallery = page.locator('#gallery img');
    this.qty = page.locator('#qty');
    this.btnAddCart = page.locator('#btn-cart');
    this.alert = page.locator('#alert');
    this.reviews = page.locator('#reviews');
    this.reviewBox = page.locator('#review-box');
    this.revRating = page.locator('#rev-rating');
    this.revTitle = page.locator('#rev-title');
    this.revBody = page.locator('#rev-body');
    this.btnSubmitReview = page.locator('#btn-review');
  }

  async openById(id) {
    await this.goto('/Product.html?id=' + encodeURIComponent(String(id)));
  }
}

module.exports = { ProductPage };
