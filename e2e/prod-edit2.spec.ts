import { test } from '@playwright/test';

test('prod edit various users', async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', e => pageErrors.push(e.message));
  await page.goto('https://erp-platform-seven.vercel.app/login');
  await page.locator('input[type=email]').fill('demo.admin@radiant-academy.xyz');
  await page.locator('input[type=password]').fill('ScrollTest123!');
  await page.getByRole('button', { name: /se connecter|connexion/i }).click();
  await page.waitForURL(/admin|dashboard/, { timeout: 25000 });
  await page.goto('https://erp-platform-seven.vercel.app/admin/users');
  await page.waitForSelector('table tbody tr', { timeout: 25000 });
  const rows = await page.locator('table tbody tr').count();
  console.log('ROWS:', rows);
  for (let i = 0; i < Math.min(rows, 5); i++) {
    const row = page.locator('table tbody tr').nth(i);
    const name = (await row.locator('td').first().innerText()).trim();
    await row.locator('button[class*="rounded p-1"]').click();
    await page.getByText(/modifier|edit/i).first().click();
    await page.waitForTimeout(2500);
    const body = (await page.locator('body').innerText());
    const isError = body.includes('Erreur');
    console.log(`USER ${i} (${name}): ${isError ? 'ERROR PAGE' : 'OK'}`);
    if (isError) console.log('  TAIL:', JSON.stringify(body.slice(-150)));
    await page.goto('https://erp-platform-seven.vercel.app/admin/users');
    await page.waitForSelector('table tbody tr', { timeout: 25000 });
  }
  console.log('PAGE ERRORS:', JSON.stringify(pageErrors));
});
