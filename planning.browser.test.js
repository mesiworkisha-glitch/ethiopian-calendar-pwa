const { test, expect } = require('@playwright/test');

test('planning UI generates and saves a season-filtered schedule', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/index.html', { waitUntil: 'networkidle' });

  const planningTab = page.locator('#navbtn-planning');
  await expect(planningTab).toBeVisible();
  await planningTab.click();
  await expect(page.locator('#tab-planning')).toBeVisible();

  await page.locator('#planning-season-family').selectOption('climatic');
  await expect(page.locator('#planning-season option')).toHaveCount(4);

  await page.locator('#planning-year').fill('2018');
  await page.locator('#planning-month').fill('1');
  await page.locator('#planning-day').fill('1');
  await page.locator('#planning-period-value').fill('1');
  await page.locator('#planning-period-unit').selectOption('month');
  await page.locator('#planning-interval-value').fill('1');
  await page.locator('#planning-interval-unit').selectOption('day');
  await page.locator('#planning-season').selectOption({ index: 1 });
  await page.locator('#planning-form-integrated button[type="submit"]').click();

  await expect(page.locator('#planning-schedule-integrated table')).toBeVisible();
  await expect(page.locator('#planning-schedule-integrated tbody tr').first()).toBeVisible();
  expect(errors).toEqual([]);

  await page.locator('#planning-save').click();
  const plans = await page.evaluate(() => JSON.parse(localStorage.getItem('ethio-calendar-plans-v1') || '[]'));
  expect(plans).toHaveLength(1);
  expect(plans[0].rows.length).toBeGreaterThan(0);
});

test('planning UI exposes accessible controls and export actions', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/index.html', { waitUntil: 'networkidle' });
  await page.locator('#navbtn-planning').click();

  for (const id of [
    'planning-name', 'planning-year', 'planning-month', 'planning-day',
    'planning-period-value', 'planning-period-unit', 'planning-interval-value',
    'planning-interval-unit', 'planning-season-family', 'planning-season'
  ]) {
    await expect(page.locator(`label[for="${id}"]`)).toBeVisible();
  }

  const downloadPromise = page.waitForEvent('download');
  await page.locator('#planning-year').fill('2018');
  await page.locator('#planning-month').fill('1');
  await page.locator('#planning-day').fill('1');
  await page.locator('#planning-period-value').fill('1');
  await page.locator('#planning-period-unit').selectOption('month');
  await page.locator('#planning-interval-value').fill('7');
  await page.locator('#planning-interval-unit').selectOption('day');
  await page.locator('#planning-form-integrated button[type="submit"]').click();
  await page.locator('[data-px="csv"]').click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/\.csv$/);
  expect(errors).toEqual([]);
});
