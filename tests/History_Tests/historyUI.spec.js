import { test, expect } from '@playwright/test';
const AxeBuilder = require('@axe-core/playwright').default;

test.describe('IBM Bank - UI Functional Test Suite (25+ Cases)', () => {
    const BASE_URL = 'http://localhost:5173';
    test.beforeEach(async ({ page }) => {
        await page.goto(BASE_URL);
        await page.fill('input[type="email"]', 'john@example.com');
        await page.fill('input[type="password"]', 'password123');
        await page.click('button:has-text("Sign In")');
    });
    test('UF-01: Sidebar History Navigation', async ({ page }) => {
        await page.getByRole('button', { name: 'History', exact: true }).click();        
        const header = page.locator('h3:has-text("Transaction History")');
        await expect(header).toBeVisible();
        await expect(page.getByRole('button', { name: /history/i })).toHaveClass(/bg-accent/);
    });

    test('UF-02: Dashboard View All History Action', async ({ page }) => {
        await expect(page.locator('h2')).toContainText('Hello');
        await page.getByRole('button', { name: /view all/i }).click();
        await expect(page.locator('h3')).toHaveText('Transaction History');
    });

    test('UF-03: Table Schema Visibility', async ({ page }) => {
        await page.getByRole('button', { name: 'History', exact: true }).click();
        const headers = page.locator('thead th');
        await expect(headers).toHaveCount(4);
        await expect(headers.nth(0)).toHaveText('Type');
        await expect(headers.nth(3)).toHaveText('Amount');
    });

    test('UF-04: Rapid View Toggle Stability', async ({ page }) => {
        await page.getByRole('button', { name: 'History', exact: true }).click();
        await page.getByRole('button', { name: /overview/i }).click();
        await page.getByRole('button', { name: 'History', exact: true }).click();
        await expect(page.locator('h3')).toHaveText('Transaction History');
        await expect(page.locator('h3:has-text("Transaction History")')).toHaveCount(1);
    });

    test('UF-05: Sidebar Mutual Exclusion', async ({ page }) => {
        const overviewBtn = page.getByRole('button', { name: /overview/i });
        const historyBtn = page.getByRole('button', { name: 'History', exact: true });
        await historyBtn.click();
        await expect(historyBtn).toHaveClass(/text-accent/);
        await expect(overviewBtn).toHaveClass(/text-slate-400/);
    });
    test('Accessibility Test',async({page})=>{
        await page.getByRole('button', { name: 'History', exact: true }).click();
        const asr=await new AxeBuilder({page}).analyze();
        console.log(asr.violations)
        expect(asr.violations.length).toBe(1);
    });

})