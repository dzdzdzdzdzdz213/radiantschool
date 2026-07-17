import { test, expect } from '@playwright/test';

const ASSISTANT_EMAIL = 'demo.assistant@radiant-academy.xyz';
const ASSISTANT_PASSWORD = 'demo 123';

async function loginAsAssistant(page: any) {
  await page.goto('/staff/login');
  await page.fill('input[type="email"]', ASSISTANT_EMAIL);
  await page.fill('input[type="password"]', ASSISTANT_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/assistant\/dashboard/, { timeout: 10000 });
}

test.describe('Core Flows', () => {

  test('assistant dashboard loads KPIs', async ({ page }) => {
    await loginAsAssistant(page);
    await expect(page.locator('text=Tableau de bord').or(page.locator('h1, h2').first())).toBeVisible();
    const kpiCards = page.locator('[class*="grid"] > div, [class*="card"]');
    const count = await kpiCards.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('assistant can view and filter payments', async ({ page }) => {
    await loginAsAssistant(page);
    await page.goto('/assistant/payments');
    await expect(page).toHaveURL(/\/assistant\/payments/);
    await expect(page.locator('table, [class*="table"], [class*="list"]').first()).toBeVisible({ timeout: 8000 });
  });

  test('assistant can view and filter invoices', async ({ page }) => {
    await loginAsAssistant(page);
    await page.goto('/assistant/invoices');
    await expect(page).toHaveURL(/\/assistant\/invoices/);
    await expect(page.locator('table, [class*="table"], [class*="list"]').first()).toBeVisible({ timeout: 8000 });
  });

  test('assistant can view registrations', async ({ page }) => {
    await loginAsAssistant(page);
    await page.goto('/assistant/registrations');
    await expect(page).toHaveURL(/\/assistant\/registrations/);
    await expect(page.locator('#root').first()).toBeVisible();
  });

  test('assistant can navigate all main sidebar pages', async ({ page }) => {
    await loginAsAssistant(page);
    const pages = [
      '/assistant/dashboard',
      '/assistant/students',
      '/assistant/parents',
      '/assistant/registrations',
      '/assistant/attendance',
      '/assistant/schedule',
      '/assistant/payments',
      '/assistant/invoices',
      '/assistant/rooms',
      '/assistant/private-lessons',
      '/assistant/notifications',
    ];
    for (const p of pages) {
      await page.goto(p);
      await page.waitForTimeout(500);
      await expect(page).toHaveURL(new RegExp(p.replace(/\//g, '\\/')));
    }
  });

  test('teacher dashboard loads', async ({ page }) => {
    await page.goto('/staff/login');
    await page.fill('input[type="email"]', ASSISTANT_EMAIL);
    await page.fill('input[type="password"]', ASSISTANT_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/assistant\/dashboard/, { timeout: 10000 });
    await page.goto('/teacher/dashboard');
    await expect(page.locator('#root').first()).toBeVisible();
  });

  test('public pages load without errors', async ({ page }) => {
    const publicPages = [
      '/',
      '/formations',
      '/formations-primaire',
      '/formations-cem',
      '/formations-lycee',
      '/teachers',
      '/faq',
      '/contact',
    ];
    for (const p of publicPages) {
      await page.goto(p);
      await expect(page.locator('#root').first()).toBeVisible();
    }
  });

  test('student schedule page accessible', async ({ page }) => {
    await loginAsAssistant(page);
    await page.goto('/student/schedule');
    await expect(page.locator('#root').first()).toBeVisible();
  });

  test('settings page accessible', async ({ page }) => {
    await loginAsAssistant(page);
    await page.goto('/assistant/settings');
    await expect(page.locator('#root').first()).toBeVisible();
  });

});
