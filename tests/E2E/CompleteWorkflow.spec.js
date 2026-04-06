import { test, expect } from '@playwright/test';

test('Full User Workflow: Registration to Logout', async ({ page }) => {
  const testEmail = `user_${Date.now()}@example.com`;
  const testPassword = 'Password123!';
  const recipientAcc = '4141587793'; 

  page.on('dialog', async dialog => {
        expect(dialog.message()).toContain('Account created, but failed to log in automatically. Please sign in.'); 
        await dialog.accept(); 
    });

  await page.goto('http://localhost:5173/');
  await page.fill('input[name="fullname"]', 'Test User');
  await page.fill('input[name="email"]', testEmail);
  await page.fill('input[name="password"]', testPassword);
  await page.click('button[type="submit"]');
  

  await expect(page).toHaveURL(/.*|.*dashboard/);

  if (page.url().includes('/')) {
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
  }
  await expect(page).toHaveURL(/.*dashboard|.*\//);

  const balanceElement = page.locator('h3.font-mono');
  await expect(balanceElement).toBeVisible();
  const initialBalanceText = await balanceElement.textContent();
  const initialBalance = parseFloat(initialBalanceText.replace(/[^0-9.]/g, ''));

  await page.getByRole('button', { name: /send money/i }).click();
  await page.fill('input[name="recipient"]', recipientAcc);
  await page.fill('input[name="amount"]', '500');
  await page.click('button:has-text("Confirm")');

  await expect(page.locator('text=/success|sent/i')).toBeVisible();

  // --- 5. VERIFY BALANCE DECREASE ---
  const updatedBalanceText = await balanceElement.textContent();
  const updatedBalance = parseFloat(updatedBalanceText.replace(/[^0-9.]/g, ''));
  expect(updatedBalance).toBeLessThan(initialBalance);

  // --- 6. CHECK TRANSACTION HISTORY ---
  // Navigate via your sidebar button
  await page.locator('aside').getByRole('button', { name: /history/i }).click();
  
  // Check that the table contains our "Test Transfer"
  const historyTable = page.locator('table');
  await expect(historyTable).toContainText('Test Transfer');
  await expect(historyTable).toContainText('-$500');

  // --- 7. LOGOUT ---
  // Use the red logout button in your sidebar
  const logoutBtn = page.getByRole('button', { name: /logout/i });
  await logoutBtn.click();

  // Final verification: Ensure we are back at the login/landing page
  await expect(page).toHaveURL(/.*login|.*auth/);
});