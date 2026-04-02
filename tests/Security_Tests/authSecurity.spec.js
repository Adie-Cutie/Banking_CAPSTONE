import { test, expect } from '@playwright/test';

test.describe('IBM Bank - Authentication Security Suite (SEC 01-10)', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:5173');
    });

    test('SEC-01: NoSQL Injection in Login Bypass', async ({ page }) => {
        await page.getByPlaceholder(/email/i).fill("' OR 1=1 --");
        await page.getByPlaceholder(/password/i).fill("anyPassword");
        await page.getByRole('button', { name: 'Sign In' }).click();
        await expect(page).not.toHaveURL(/.*dashboard/);
    });


    test('SEC-02: JWT Persistence - Post-Logout Cleanup', async ({ page }) => {
        
        await page.fill('input[type="email"]', 'john@example.com');
        await page.fill('input[type="password"]', 'password123');
        await page.click('button:has-text("Sign In")');
        await page.evaluate(() => localStorage.setItem('token', 'fake-jwt-token'));
        await page.getByRole('button', { name: /logout/i }).click();
        const token = await page.evaluate(() => localStorage.getItem('token'));
        expect(token).toBeNull();
    });

    test('SEC-03: Password Masking & DOM Security', async ({ page }) => {
        const passwordInput = page.getByPlaceholder(/password/i);
        await expect(passwordInput).toHaveAttribute('type', 'password');
    });

    test('SEC-04: Broken Authentication - Direct URL Access', async ({ page }) => {
        await page.context().clearCookies();
        await page.evaluate(() => localStorage.clear());
        await page.goto('http://localhost:5173/dashboard');
        await expect(page.getByRole('button',{name:'Sign In'})).toBeVisible();
    });

    test('SEC-05: JWT Token Tampering', async ({ page }) => {
        await page.evaluate(() => {
            localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalidpayload.tampered');
        });
        await page.goto('http://localhost:5173/dashboard');
        // The backend should reject this and the frontend should redirect
        await expect(page.getByRole('button',{name:'Sign In'})).toBeVisible();
    });

    test('SEC-06: Secure Cookie Flags', async ({ page }) => {
        const cookies = await page.context().cookies();
        for (const cookie of cookies) {
            if (cookie.name === 'session' || cookie.name === 'token') {
                expect(cookie.httpOnly).toBe(true);
                expect(cookie.secure).toBe(true);
                expect(cookie.sameSite).toBe('Strict');
            }
        }
    });
});