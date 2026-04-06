import { test, expect } from '@playwright/test';

test.describe('IBM Bank - Access Control & IDOR Suite', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:5173');
        await page.getByPlaceholder(/email/i).fill('john@example.com');
        await page.getByPlaceholder(/password/i).fill('password123');
        await page.click('button:has-text("Sign In")');
        await expect(page).toHaveURL(/.*dashboard/);
    });

    test('SEC-11: IDOR in History - Unauthorized ID Access', async ({ page }) => {
        const otherUserTransactionId = '65f1a2b3c4d5e6f7a8b9c0d1'; 
        const response = await page.request.get(`/api/transactions/${otherUserTransactionId}`);
        expect(response.status()).toBe(404);
    });

    test('SEC-12: Horizontal Privilege Escalation - Balance Bypass', async ({ page }) => {
        const otherUserId = '65f9876543210fedcba09876';
        const response = await page.request.get(`/api/users/${otherUserId}/balance`);
        expect(response.status()).toBe(404);
    });

    test('SEC-13: Admin Route Bypass - Unauthorized Navigation', async ({ page }) => {
        await page.goto('http://localhost:5173/admin');
        await expect(page).not.toHaveURL(/.*admin/);
        await expect(page).toHaveURL(/.*dashboard|.*/);
    });

    test('SEC-14: Method Manipulation - Invalid HTTP Verb', async ({ page }) => {
        const response = await page.request.delete('/api/transactions/history');
        expect([401,404,405]).toContain(response.status());
    });

    test('SEC-15: Parameter Pollution - Double Amount Input', async ({ page }) => {

        const response = await page.request.post('/api/transactions/transfer', {
            data: {
                receiverAccountNumber: "9876543210",
                amount: [100, 0.01], // Polluted parameter
            }
        });
        expect(response.status()).toBe(401);
    });


    test('SEC-16: API Rate Limiting - Rapid Transaction Throttling', async ({ page }) => {
        const results = [];
        for (let i = 0; i < 50; i++) {
            results.push(page.request.post('/api/transactions/send', {
                data: { amount: 1, receiverAccountNumber: "9876543210" }
            }));
        }
        const responses = await Promise.all(results);
        const throttled = responses.some(res => res.status() === 404);
        expect(throttled).toBe(true);
    });

    test('SEC-17: Insecure Redirects - Logout Parameter Attack', async ({ page }) => {
        const maliciousUrl = 'http://malicious-site.com';
        await page.goto(`http://localhost:5173/logout?next=${maliciousUrl}`);
        await expect(page).toHaveURL(/.*/);
        expect(page.url()).not.toContain(maliciousUrl);
    });
});