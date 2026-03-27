import { test, expect } from '@playwright/test';

test.describe('Auth Module - UI Tests', () => {
  const BASE_URL = 'http://localhost:5173';

  test('UI-01: Verify Login page loads with all elements', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button:has-text("Sign In")')).toBeEnabled();
  });

  test('UI-02: Show error message on invalid login credentials', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.fill('input[type="email"]', 'wrong@ibm.com');
    await page.fill('input[type="password"]', 'WrongPass123');
    await page.click('button:has-text("Sign In")');
    
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Invalid credentials'); // Verify text
      await dialog.accept(); // Clicks "OK"
    });
  });

  test('UI-03: Toggle between Login and Registration forms', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.click('text=Create Account');
    await expect(page.locator('input[placeholder="Full Name"]')).toBeVisible();
    await page.click('text=Log In');
    await expect(page.locator('input[placeholder="Full Name"]')).toBeHidden();
  });

  test('UI-04: Successful Login redirects to Dashboard', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.fill('input[type="email"]', 'john@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Sign In")');
    
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator('text=Total Balance')).toBeVisible();
  });

  test('UI-05: Logout clears session and redirects to Home', async ({ page }) => {
    // Assuming user is already logged in for this test
    await page.goto(BASE_URL);
    await page.fill('input[type="email"]', 'john@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Sign In")');
    
    await expect(page).toHaveURL(/.*dashboard/);
    await page.getByRole('button', { name: 'Logout' }).click();
    await expect(page).toHaveURL(BASE_URL);
    
    // Check if localStorage is empty
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeNull();
  });
});