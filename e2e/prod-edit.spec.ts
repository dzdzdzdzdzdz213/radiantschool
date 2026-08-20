import { test } from '@playwright/test';

test('prod edit user page', async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', e => pageErrors.push(e.message));
  await page.goto('https://erp-platform-seven.vercel.app/login');
  await page.locator('input[type=email]').fill('demo.admin@radiant-academy.xyz');
  await page.locator('input[type=password]').fill('ScrollTest123!');
  await page.getByRole('button', { name: /se connecter|connexion/i }).click();
  await page.waitForURL(/admin|dashboard/, { timeout: 25000 });
  await page.goto('https://erp-platform-seven.vercel.app/admin/users');
  await page.waitForSelector('table tbody tr', { timeout: 25000 });
  await page.locator('table tbody tr').first().locator('button[class*="rounded p-1"]').click();
  await page.getByText(/modifier|edit/i).first().click();
  await page.waitForTimeout(4000);
  console.log('URL:', page.url());
  console.log('BODY:', JSON.stringify((await page.locator('body').innerText()).slice(-200)));
  console.log('PAGE ERRORS:', JSON.stringify(pageErrors));
});
