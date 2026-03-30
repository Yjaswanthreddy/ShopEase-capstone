/**
 * @param {import('@playwright/test').Page} page
 */
async function waitForApiIdle(page) {
  await page.waitForLoadState('domcontentloaded');
  await page.locator('body').waitFor({ state: 'visible' });
}

module.exports = { waitForApiIdle };
