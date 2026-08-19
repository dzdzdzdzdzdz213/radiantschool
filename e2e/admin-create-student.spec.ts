import { test, expect } from '@playwright/test';

const ADMIN_EMAIL = 'demo.admin@radiant-academy.xyz';
const ADMIN_PASS = 'ScrollTest123!';

test('admin creates a student then remains logged in (session not cleared by signUp)', async ({ page }) => {
  await page.goto('/staff/login');
  await page.locator('input[type="email"]').first().fill(ADMIN_EMAIL);
  await page.locator('input[type="password"]').first().fill(ADMIN_PASS);
  await page.locator('button', { hasText: 'Connexion' }).first().click();
  await page.waitForURL(/\/admin\/dashboard/, { timeout: 15000 });

  await page.goto('/admin/users/new');
  await expect(page).toHaveURL(/\/admin\/users\/new/);

  const email = `e2e-${Date.now()}@t.dz`;
  const suffix = String.fromCharCode(97 + (Date.now() % 26)) + String.fromCharCode(97 + ((Date.now() >> 3) % 26));
  const firstName = `E2E${suffix}`;
  await page.getByRole('textbox').nth(0).fill(firstName);
  await page.getByRole('textbox').nth(1).fill('SessionTest');
  await page.getByRole('textbox').nth(2).fill(email);

  await page.locator('button', { hasText: 'Sélectionner un rôle' }).first().click();
  await page.getByRole('button', { name: 'Élève', exact: true }).click();
  await expect(page.locator('button', { hasText: 'Sélectionner un rôle' })).toHaveCount(0);
  await expect(page.getByText(/invitation sera envoyé/)).toBeVisible();
  await page.locator('button', { hasText: /Cr[eé]er/ }).first().click();

  await expect(page).toHaveURL(/\/admin\/users$/, { timeout: 20000 });
  await expect(page.locator('body')).not.toContainText('row-level security', { timeout: 5000 });

  const res = await page.evaluate(async () => {
    const { supabase } = await import('/src/lib/supabase.ts');
    const { data: { session } } = await supabase.auth.getSession();
    return { loggedIn: !!session?.user, email: session?.user?.email };
  });
  expect(res.loggedIn).toBe(true);
  expect(res.email).toBe(ADMIN_EMAIL);

  const user = await page.evaluate(async (targetEmail) => {
    const { supabase } = await import('/src/lib/supabase.ts');
    const { data } = await supabase
      .from('users')
      .select('email, first_name, last_name, role, status, invite_token')
      .eq('email', targetEmail)
      .maybeSingle();
    return data;
  }, email);
  expect(user).toBeTruthy();
  expect(user.role).toBe('student');
  expect(user.status).toBe('pending');
  expect(user.invite_token).toBeTruthy();
});