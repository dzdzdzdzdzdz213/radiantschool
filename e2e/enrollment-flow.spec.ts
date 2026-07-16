import { test, expect } from '@playwright/test';

test.describe('Enrollment Flow', () => {
  test('public pages are accessible', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1, h2').first()).toBeVisible();

    await page.goto('/formations');
    await expect(page).toHaveURL(/\/formations/);

    await page.goto('/enroll');
    await expect(page.locator('text=Élève').or(page.locator('text=Parent'))).toBeVisible();
  });

  test('login with demo assistant account', async ({ page }) => {
    await page.goto('/staff/login');
    await page.fill('input[type="email"]', 'demo.assistant@radiant-academy.xyz');
    await page.fill('input[type="password"]', 'demo 123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/assistant\/dashboard/, { timeout: 10000 });
    await expect(page.locator('text=Tableau de bord').or(page.locator('h1, h2').first())).toBeVisible();
  });

  test('assistant can view students list', async ({ page }) => {
    await page.goto('/staff/login');
    await page.fill('input[type="email"]', 'demo.assistant@radiant-academy.xyz');
    await page.fill('input[type="password"]', 'demo 123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/assistant\/dashboard/, { timeout: 10000 });

    await page.goto('/assistant/students');
    await expect(page).toHaveURL(/\/assistant\/students/);
  });
});
