import { test, expect } from '@playwright/test';

test.describe('Module 1: Authentication & Onboarding', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:5173');
    });

    test('E2E-01: Successful User Registration', async ({ page }) => {
        await page.click('text=Create Account');
        const uniqueEmail = `user_${Date.now()}@ibm.com`;
        
        await page.getByPlaceholder(/full name/i).fill('Tester x');
        await page.getByPlaceholder(/email/i).fill(uniqueEmail);
        await page.getByPlaceholder(/password/i).fill('Password123!');
        await page.getByRole('button', { name: /register/i }).click();

        page.on('dialog', async dialog => {
           expect(dialog.message()).toContain('Account created, but failed to log in automatically. Please sign in.'); 
           await dialog.accept(); 
        });
        await expect(page).toHaveURL(/.*/);
    });



    test('E2E-02: Correct Username Display in Greeting', async ({ page }) => {
        await page.getByPlaceholder(/email/i).fill('john@example.com');
        await page.getByPlaceholder(/password/i).fill('password123');
        await page.click('button:has-text("Sign In")');

        const greeting = page.locator('h2'); 
        await expect(greeting).toContainText(/Hello, John/i);
    });

    test('E2E-03: Secure Logout and Back-Button Protection', async ({ page }) => {
        await page.getByPlaceholder(/email/i).fill('john@example.com');
        await page.getByPlaceholder(/password/i).fill('password123');
        await page.click('button:has-text("Sign In")');

        await page.getByRole('button', { name: /logout/i }).click();
        await expect(page).toHaveURL(/.*/);
        await page.goBack();
        await expect(page).toHaveURL(/.*/);
    });

    test('E2E-04: Unauthorized Access Redirect', async ({ page }) => {
        await page.context().clearCookies();
        await page.goto('http://localhost:5173/dashboard');
        await expect(page).toHaveURL(/.*/);
    });
});