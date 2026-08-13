import { test, expect } from '@playwright/test';

test.describe('public surfaces', () => {
  test('home page renders the landing and navigation', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Radiant/);
    await expect(page.locator('header, nav').first()).toBeVisible();
  });

  test('login page renders email + password fields', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('input[type="email"]').first()).toBeVisible();
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
  });

  test('contact page renders the contact form', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.locator('input, textarea').first()).toBeVisible();
  });
});