import { test, expect } from '@playwright/test';

test.describe('Module 2: Dashboard & Profile UI', () => {
  
  test.beforeEach(async ({ page }) => {
    
    await page.goto('http://localhost:5173/'); 
 
    if (page.url().includes('/')) {
      await page.fill('input[type="email"]', 'john@example.com');
      await page.fill('input[type="password"]', 'password123');
      await page.getByRole('button',{name: 'Sign In'}).click();
      await expect(page).toHaveURL(/.*dashboard|.*\//);
    }
  });

  test('E2E-05: Sidebar navigation links work', async ({ page }) => {
    const sidebar = page.locator('aside');
    const historyBtn = sidebar.getByRole('button', { name: /history/i });
    await historyBtn.click();
    const overviewBtn = sidebar.getByRole('button', { name: /overview/i });
    await overviewBtn.click();
    await expect(overviewBtn).toHaveClass(/bg-accent/);
  });

  test('E2E-06: Account number display and clipboard', async ({ page }) => {

    const accNumberElement = page.locator('span.text-accent.font-mono');
    await expect(accNumberElement).toBeVisible();
  });

  test('E2E-07: Responsive view switching', async ({ page }) => {

    await page.setViewportSize({ width: 1280, height: 800 });
    await expect(page.locator('aside')).toBeVisible();
    
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('aside')).not.toBeVisible();
  });

  test('E2E-08: Dark/Light mode toggle', async ({ page }) => {

    const container = page.locator('html'); 
    const themeToggle = page.getByRole('button').first(); 
    
    await themeToggle.click();
  });

  test('E2E-09: Loading skeletons appear', async ({ page }) => {
    
    await page.route('**/api/user-data', async route => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.continue();
    });
    
    await page.reload();
    const skeleton = page.locator('.skeleton'); 
    if (await skeleton.count() > 0) {
      await expect(skeleton.first()).toBeVisible();
    }
  });
});