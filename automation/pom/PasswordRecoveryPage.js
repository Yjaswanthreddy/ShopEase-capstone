const { BasePage } = require('./BasePage');

/** Module 03 — Forgot / reset password */
class PasswordRecoveryPage extends BasePage {
  constructor(page) {
    super(page);
    this.forgotEmail = page.locator('#email');
    this.forgotForm = page.locator('#form');
    this.forgotSubmit = page.locator('#form button[type="submit"]');
    this.forgotAlert = page.locator('#alert');

    this.resetToken = page.locator('#token');
    this.resetPassword = page.locator('#password');
    this.resetForm = page.locator('#form');
    this.resetSubmit = page.locator('#form button[type="submit"]');
    this.resetAlert = page.locator('#alert');
  }

  async openForgot() {
    await this.goto('/Forgot.html');
  }

  async openReset(token) {
    const q = token ? `?token=${encodeURIComponent(token)}` : '';
    await this.goto('/Reset.html' + q);
  }

  async requestReset(email) {
    await this.forgotEmail.fill(email);
    await this.forgotSubmit.click();
  }

  async submitNewPassword(token, newPassword) {
    if (token) await this.resetToken.fill(token);
    await this.resetPassword.fill(newPassword);
    await this.resetSubmit.click();
  }
}

module.exports = { PasswordRecoveryPage };
