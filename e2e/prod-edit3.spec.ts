import { test } from '@playwright/test';

const targets = [
  ['demo admin', '525ab06e-5e73-45a7-94ba-9591ade0229c'],
  ['demo assistant', '6d4ce9cd-0b6a-4b80-99ef-d01c1ad25329'],
  ['demo teacher', '6763701e-3393-4e25-b29b-a41f847ad246'],
  ['demo student', 'e60e7387-ac86-4f5d-bdbe-3bfbf6b348fb'],
  ['parent test', 'aaaaaaaa-0000-4000-8000-000000000003'],
];

test('prod edit specific users', async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', e => pageErrors.push(e.message));
  await page.goto('https://erp-platform-seven.vercel.app/login');
  await page.locator('input[type=email]').fill('demo.admin@radiant-academy.xyz');
  await page.locator('input[type=password]').fill('ScrollTest123!');
  await page.getByRole('button', { name: /se connecter|connexion/i }).click();
  await page.waitForURL(/admin|dashboard/, { timeout: 25000 });
  for (const [label, id] of targets) {
    await page.goto(`https://erp-platform-seven.vercel.app/admin/users/edit/${id}`);
    await page.waitForTimeout(3000);
    const body = await page.locator('body').innerText();
    const isError = body.includes('Erreur') && !body.includes('Prénom *');
    console.log(`${label}: ${isError ? 'ERROR PAGE' : 'OK'}`);
    if (isError) console.log('  TAIL:', JSON.stringify(body.slice(-120)));
  }
  console.log('PAGE ERRORS:', JSON.stringify(pageErrors));
});
