const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: '.',
  testMatch: 'planning.browser.test.js',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    headless: true,
  },
  reporter: 'line',
});
