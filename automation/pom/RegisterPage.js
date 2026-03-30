const { BasePage } = require('./BasePage');

/** Module 02 — User registration */
class RegisterPage extends BasePage {
  constructor(page) {
    super(page);
    this.name = page.locator('#name');
    this.email = page.locator('#email');
    this.password = page.locator('#password');
    this.submit = page.locator('#form button[type="submit"]');
    this.linkLogin = page.getByRole('link', { name: /Already have an account/i });
    this.alert = page.locator('#alert');
  }

  async open() {
    await this.goto('/Register.html');
  }

  async register(name, email, password) {
    await this.name.fill(name);
    await this.email.fill(email);
    await this.password.fill(password);
    await this.submit.click();
  }
}

module.exports = { RegisterPage };
