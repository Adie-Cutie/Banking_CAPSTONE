import { test, expect } from '@playwright/test';

test.describe('IBM Bank - Data Privacy & Injection Suite (SEC 11-20)', () => {

    test.beforeEach(async ({ page }) => {
        // Step 0: Login to establish session
        await page.goto('http://localhost:5173');
        await page.getByPlaceholder(/email/i).fill('john@example.com');
        await page.getByPlaceholder(/password/i).fill('password123');
        await page.click('button:has-text("Sign In")');
        await expect(page).toHaveURL(/.*dashboard/);
    });

    test('SEC-07: PII Leakage and Password in API Payload', async ({ page }) => {
        const responsePromise = page.waitForResponse(res => res.url().includes('/api/transactions/history'));
        await page.getByRole('button', { name: 'History', exact: true }).click();
        const response = await responsePromise;
        const data = await response.json();

        if (data.length > 0) {
            const firstRecord = data[0];
            expect(firstRecord.sender.password).toBeUndefined();
            expect(firstRecord.receiver?.password).toBeUndefined();
            expect(firstRecord.sender.email).toBeUndefined();
        }
    });

    test('SEC-08: XSS and HTML Injection in Transactions', async ({ page }) => {
        const xssPayload = "<script>alert('XSS')</script>";
        const htmlPayload = "<h1>Hacked</h1>";

        await page.getByRole('button',{name:'Send Money'}).click(); // Go to transfer section
        await page.getByPlaceholder(/account/i).fill('9876543210');
        await page.getByPlaceholder(/amount/i).fill('10');
        await page.click('button:has-text("Confirm")');

        await page.getByRole('button', { name: 'History', exact: true }).click();

        const h1InTable = page.locator('td h1');
        await expect(h1InTable).toHaveCount(0);
    });

    test('SEC-09: Console Log Cleanup', async ({ page }) => {
        const logs = [];
        page.on('console', msg => logs.push(msg.text()));
        await page.getByRole('button', { name: 'History', exact: true }).click();
        const sensitiveInfoLeaked = logs.some(log => 
            log.toLowerCase().includes('password') || 
            log.includes('1703774998') 
        );
        expect(sensitiveInfoLeaked).toBe(false);
    });

    test('SEC-10: Error Message Exposure (Stack Trace Check)', async ({ page }) => {

        await page.route('**/api/transactions/history', route => {
            route.fulfill({
                status: 500,
                contentType: 'application/json',
                body: JSON.stringify({ error: "Internal Server Error", stack: "mongodb://user:pass@cluster..." })
            });
        });

        await page.getByRole('button', { name: 'History', exact: true }).click();
        const bodyText = await page.innerText('body');
        expect(bodyText).not.toContain('mongodb://');
        expect(bodyText).not.toContain('at Context.<anonymous>');
    });

});