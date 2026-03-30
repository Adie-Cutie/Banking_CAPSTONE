import { test, expect } from '@playwright/test';
const AxeBuilder = require('@axe-core/playwright').default;


test.describe('IBM Bank - Fund Transfer UI Tests', () => {
    const BASE_URL = 'http://localhost:5173';
    test.beforeEach(async ({ page }) => {
        await page.goto(BASE_URL);
        await page.fill('input[type="email"]', 'john@example.com');
        await page.fill('input[type="password"]', 'password123');
        await page.click('button:has-text("Sign In")');
    });

    test('UI-TR-01: Successful Transfer Navigation', async ({ page }) => {
        const sendMoneyBtn = page.getByRole('button', { name: /send money/i });
        await sendMoneyBtn.click();
        await expect(page.locator('h3:has-text("Transfer Funds")')).toBeVisible();

    });

    test('UI-TR-04: Field Validation', async ({ page }) => {

        await page.getByRole('button', { name: /send money/i }).click();
        const confirmBtn = page.getByRole('button', { name: /confirm/i });
        await expect(confirmBtn).toBeVisible();

        const accInput = page.getByPlaceholder('Account Number');
        const amountInput = page.getByPlaceholder('Amount ($)');

        await expect(accInput).toHaveAttribute('required', '');
        await expect(amountInput).toHaveAttribute('required', '');
        
    });

    test('UI-TR-02: Instant Balance Update', async ({ page }) => {
       
       const transferAmount = 75;
       const recipientAccount = '1499493221';

        const balanceLocator = page.locator('h3.text-5xl.font-mono');
        const initialBalanceText = await balanceLocator.textContent();
        const initialBalance = parseFloat(initialBalanceText.replace(/[^0-9.-]+/g, ""));

        await page.getByRole('button', { name: /send money/i }).click();
        await page.getByPlaceholder('Account Number').fill(recipientAccount);
        await page.getByPlaceholder('Amount ($)').fill(transferAmount.toString());
    
        await page.getByRole('button', { name: /confirm/i }).click();
        page.on('dialog', async dialog => {
            expect(dialog.message()).toContain('Transfer Successful! Amount deducted from your Account :(');
            await dialog.accept();
        });

        const expectedBalance = initialBalance - transferAmount;
        const expectedBalanceFormatted = expectedBalance.toLocaleString('en-US');
        await expect(balanceLocator).toContainText(`$${expectedBalanceFormatted}`);
    
        const recentActivity = page.locator('table tbody tr').first();
    
        await expect(recentActivity).toContainText('transfer');
        await expect(recentActivity).toContainText(`-$${transferAmount}`);
        const expenseCard = page.locator('h4.text-red-400');
        await expect(expenseCard).toBeVisible();
        

    });

    test('UI-TR-03: Invalid Account Number Alert', async ({ page }) => {
        await page.getByRole('button', { name: /send money/i }).click();
        await page.getByPlaceholder('Account Number').fill('0000000000');
        await page.getByPlaceholder('Amount ($)').fill('10');
        await page.getByRole('button', { name: /confirm/i }).click();

        page.on('dialog', async dialog => {
        // Verify the alert message is exactly what we expect
            expect(dialog.message()).toContain('Receiver not found');
            await dialog.accept();
        });
    });

    test('UI-TR-05: Cancel Button Functionality', async ({ page }) => {
        await page.getByRole('button', { name: /send money/i }).click();
        await page.getByRole('button', { name: /cancel/i }).click();
        await expect(page.locator('h3:has-text("Transfer Funds")')).toBeHidden();
    });

    test('Accessibility Test',async({page})=>{
        const asr=await new AxeBuilder({page}).analyze();
        console.log(asr.violations)
        expect(asr.violations.length).toBe(0);
    });
});