const { BasePage } = require('./BasePage');

/** Module 01 — Authentication (Login) */
class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    this.email = page.locator('#email');
    this.password = page.locator('#password');
    this.form = page.locator('#form');
    this.submit = page.locator('#form button[type="submit"]');
    this.linkForgot = page.getByRole('link', { name: /Forgot password/i });
    this.linkRegister = page.getByRole('link', { name: /Create account/i });
    this.alert = page.locator('#alert');
  }

  async open() {
    await this.goto('/Login.html');
  }

  async login(email, password) {
    await this.email.fill(email);
    await this.password.fill(password);
    await this.submit.click();
  }

  async submitEmpty() {
    await this.email.fill('');
    await this.password.fill('');
    await this.submit.click();
  }
}

module.exports = { LoginPage };
