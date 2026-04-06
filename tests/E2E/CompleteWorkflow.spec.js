import { test, expect } from '@playwright/test';

test('Full User Workflow: Registration to Logout', async ({ page }) => {
  const testEmail = `user_${Date.now()}@example.com`;
  const testPassword = 'Password123!';
  const recipientAccount = '4141587793'; 
  const transferAmount=1;

  page.on('dialog', async dialog => {
        await dialog.accept(); 
  });

  await page.goto('http://localhost:5173/');
  await page.click('text=Create Account');
  await page.getByPlaceholder("Full Name").fill("Test User");
  await page.getByPlaceholder("Email Address").fill(testEmail);
  await page.getByPlaceholder("Password").fill(testPassword);
  await page.click('button:has-text("Register")');
  

  await expect(page).toHaveURL(/.*|.*dashboard/);

  if (page.url().includes('/')) {
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button:has-text("Sign In")');
  }
  await expect(page).toHaveURL(/.*dashboard|.*\//);

  const balanceLocator = page.locator('h3.text-5xl.font-mono');
  const initialBalanceText = await balanceLocator.textContent() || "$0";
  const initialBalance = parseFloat(initialBalanceText.replace(/[^0-9.-]+/g, ""));

  await page.getByRole('button', { name: /send money/i }).click();
  await page.getByPlaceholder('Account Number').fill(recipientAccount);
  await page.getByPlaceholder('Amount ($)').fill(transferAmount.toString());
  await page.getByRole('button', { name: /confirm/i }).click();

  const expectedBalance = initialBalance - transferAmount;
  const expectedBalanceFormatted = expectedBalance.toLocaleString('en-US');
  await expect(balanceLocator).toContainText(`$${expectedBalanceFormatted}`);

  const historyBtn = page.getByRole('button', { name: 'History', exact: true });
  await historyBtn.click();
  
  const historyTable = page.locator('table');
  await expect(historyTable).toContainText(/transfer/);
  await expect(historyTable).toContainText('-$1');

  const logoutBtn = page.getByRole('button', { name: /logout/i });
  await logoutBtn.click();

  await expect(page).toHaveURL(/.*|.*auth/);
});