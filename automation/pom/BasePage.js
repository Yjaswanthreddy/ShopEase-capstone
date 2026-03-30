const { resolveUrl } = require('../utils/base-url');

/**
 * @param {import('@playwright/test').Page} page
 */
class BasePage {
  constructor(page) {
    this.page = page;
  }

  async goto(path) {
    await this.page.goto(resolveUrl(path));
  }

  async expectUrl(pattern) {
    await this.page.waitForURL(pattern);
  }
}

module.exports = { BasePage };
