import { test } from '@playwright/test';

test('admin edit user page', async ({ page }) => {
  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];
  page.on('pageerror', e => pageErrors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  await page.goto('http://localhost:3000/login');
  await page.locator('input[type=email]').fill('demo.admin@radiant-academy.xyz');
  await page.locator('input[type=password]').fill('ScrollTest123!');
  await page.getByRole('button', { name: /se connecter|connexion/i }).click();
  await page.waitForURL(/admin|dashboard/, { timeout: 20000 });
  await page.goto('http://localhost:3000/admin/users');
  await page.waitForSelector('table tbody tr', { timeout: 20000 });
  await page.locator('table tbody tr').first().locator('button[class*="rounded p-1"]').click();
  await page.getByText(/modifier|edit/i).first().click();
  await page.waitForTimeout(3500);
  console.log('URL:', page.url());
  console.log('BODY:', JSON.stringify((await page.locator('body').innerText()).slice(-250)));
  console.log('PAGE ERRORS:', JSON.stringify(pageErrors));
  console.log('CONSOLE ERRORS:', JSON.stringify(consoleErrors.slice(0, 5)));
});
