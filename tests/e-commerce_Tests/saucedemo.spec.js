const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://www.saucedemo.com';

test.describe('SauceDemo Functional Check', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto(BASE_URL);
    });

    // --- SECTION 1: AUTHENTICATION
    test('1. Valid login flows to inventory', async ({ page }) => {
        await page.fill('#user-name', 'standard_user');
        await page.fill('#password', 'secret_sauce');
        await page.click('#login-button');
        await expect(page).toHaveURL(/inventory.html/);
    });

    test('2. Locked out user receives specific functional error', async ({ page }) => {
        await page.fill('#user-name', 'locked_out_user');
        await page.fill('#password', 'secret_sauce');
        await page.click('#login-button');
        await expect(page.locator('[data-test="error"]')).toContainText('locked out');
    });

    test('3. Login fails with empty fields', async ({ page }) => {
        await page.click('#login-button');
        await expect(page.locator('[data-test="error"]')).toContainText('Username is required');
    });

    test('4. Login fails with correct user but wrong password', async ({ page }) => {
        await page.fill('#user-name', 'standard_user');
        await page.fill('#password', 'wrong_pass');
        await page.click('#login-button');
        await expect(page.locator('[data-test="error"]')).toContainText('do not match');
    });

    test('5. Logout functionality clears session and redirects', async ({ page }) => {
        await page.fill('#user-name', 'standard_user');
        await page.fill('#password', 'secret_sauce');
        await page.click('#login-button');
        await page.click('#react-burger-menu-btn');
        await page.click('#logout_sidebar_link');
        await expect(page).toHaveURL(BASE_URL);
    });

    // --- SECTION 2: PRODUCT CATALOG 
    test.describe('Catalog Operations', () => {
        test.beforeEach(async ({ page }) => {
            await page.fill('#user-name', 'standard_user');
            await page.fill('#password', 'secret_sauce');
            await page.click('#login-button');
        });

        test('6. Verify all 6 items are functional in the DOM', async ({ page }) => {
            await expect(page.locator('.inventory_item')).toHaveCount(6);
        });

        test('7. Sorting: Name (A to Z) reorders items', async ({ page }) => {
            await page.selectOption('.product_sort_container', 'az');
            const firstItem = await page.locator('.inventory_item_name').first().textContent();
            expect(firstItem).toBe('Sauce Labs Backpack');
        });

        test('8. Sorting: Name (Z to A) reorders items', async ({ page }) => {
            await page.selectOption('.product_sort_container', 'za');
            const firstItem = await page.locator('.inventory_item_name').first().textContent();
            expect(firstItem).toContain('Red');
        });

        test('9. Sorting: Price (Low to High) math check', async ({ page }) => {
            await page.selectOption('.product_sort_container', 'lohi');
            const price = await page.locator('.inventory_item_price').first().textContent();
            expect(price).toBe('$7.99');
        });

        test('10. Sorting: Price (High to Low) math check', async ({ page }) => {
            await page.selectOption('.product_sort_container', 'hilo');
            const price = await page.locator('.inventory_item_price').first().textContent();
            expect(price).toBe('$49.99');
        });

        test('11. Clicking image opens detail page', async ({ page }) => {
            await page.click('#item_4_img_link');
            await expect(page).toHaveURL(/inventory-item.html\?id=4/);
        });

        test('12. Clicking title opens detail page', async ({ page }) => {
            await page.click('#item_0_title_link');
            await expect(page.locator('.inventory_details_name')).toContainText('Bike Light');
        });

        test('13. Back to products button functional flow', async ({ page }) => {
            await page.click('#item_4_title_link');
            await page.click('[data-test="back-to-products"]');
            await expect(page).toHaveURL(/inventory.html/);
        });

        test('14. Add to Cart button text change functional check', async ({ page }) => {
            const btn = page.locator('[data-test="add-to-cart-sauce-labs-backpack"]');
            await btn.click();
            await expect(btn).toHaveText('Remove');
        });

        test('15. Badge count increments on catalog page', async ({ page }) => {
            await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
            await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
        });
    });

    // --- SECTION 3: SHOPPING CART 
    test.describe('Cart Logic', () => {
        test.beforeEach(async ({ page }) => {
            await page.fill('#user-name', 'standard_user');
            await page.fill('#password', 'secret_sauce');
            await page.click('#login-button');
        });

        test('16. Add multiple items and verify total badge', async ({ page }) => {
            await page.click('[data-test="add-to-cart-sauce-labs-onesie"]');
            await page.click('[data-test="add-to-cart-sauce-labs-bike-light"]');
            await expect(page.locator('.shopping_cart_badge')).toHaveText('2');
        });

        test('17. Remove item from catalog reduces badge', async ({ page }) => {
            await page.click('[data-test="add-to-cart-sauce-labs-onesie"]');
            await page.click('[data-test="remove-sauce-labs-onesie"]');
            await expect(page.locator('.shopping_cart_badge')).toHaveCount(0);
        });

        test('18. Cart page lists selected items correctly', async ({ page }) => {
            await page.click('[data-test="add-to-cart-sauce-labs-bolt-t-shirt"]');
            await page.click('.shopping_cart_link');
            await expect(page.locator('.inventory_item_name')).toHaveText('Sauce Labs Bolt T-Shirt');
        });

        test('19. Removing item from inside cart works', async ({ page }) => {
            await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
            await page.goto(`${BASE_URL}/cart.html`);
            await page.click('[data-test="remove-sauce-labs-backpack"]');
            await expect(page.locator('.cart_item')).toHaveCount(0);
        });

        test('20. Continue Shopping button returns to inventory', async ({ page }) => {
            await page.goto(`${BASE_URL}/cart.html`);
            await page.click('[data-test="continue-shopping"]');
            await expect(page).toHaveURL(/inventory.html/);
        });

        test('21. Checkout button flows to step one', async ({ page }) => {
            await page.goto(`${BASE_URL}/cart.html`);
            await page.click('[data-test="checkout"]');
            await expect(page).toHaveURL(/checkout-step-one.html/);
        });

        test('22. Cart persists after refreshing page', async ({ page }) => {
            await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
            await page.reload();
            await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
        });

        test('23. Adding item from Product Detail page works', async ({ page }) => {
            await page.goto(`${BASE_URL}/inventory-item.html?id=4`);
            await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
            await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
        });

        test('24. Removing item from Product Detail page works', async ({ page }) => {
            await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
            await page.goto(`${BASE_URL}/inventory-item.html?id=4`);
            await page.click('[data-test="remove-sauce-labs-backpack"]');
            await expect(page.locator('.shopping_cart_badge')).toHaveCount(0);
        });

        test('25. Footer social links have correct URLs', async ({ page }) => {
            await expect(page.locator('.social_twitter a')).toHaveAttribute('href', /twitter/);
        });
    });

    // --- SECTION 4: CHECKOUT FLOW 
    test.describe('Checkout Validation', () => {
        test.beforeEach(async ({ page }) => {
            await page.fill('#user-name', 'standard_user');
            await page.fill('#password', 'secret_sauce');
            await page.click('#login-button');
            await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
            await page.goto(`${BASE_URL}/checkout-step-one.html`);
        });

        test('26. Step 1: Blocks empty First Name', async ({ page }) => {
            await page.click('[data-test="continue"]');
            await expect(page.locator('[data-test="error"]')).toContainText('First Name is required');
        });

        test('27. Step 1: Blocks empty Last Name', async ({ page }) => {
            await page.fill('[data-test="firstName"]', 'Test');
            await page.click('[data-test="continue"]');
            await expect(page.locator('[data-test="error"]')).toContainText('Last Name is required');
        });

        test('28. Step 1: Blocks empty Zip Code', async ({ page }) => {
            await page.fill('[data-test="firstName"]', 'Test');
            await page.fill('[data-test="lastName"]', 'User');
            await page.click('[data-test="continue"]');
            await expect(page.locator('[data-test="error"]')).toContainText('Postal Code is required');
        });

        test('29. Step 1: Successful navigation to Step 2', async ({ page }) => {
            await page.fill('[data-test="firstName"]', 'Test');
            await page.fill('[data-test="lastName"]', 'User');
            await page.fill('[data-test="postalCode"]', '12345');
            await page.click('[data-test="continue"]');
            await expect(page).toHaveURL(/checkout-step-two.html/);
        });

        test('30. Step 2: Item Total math check ($29.99)', async ({ page }) => {
            await page.fill('[data-test="firstName"]', 'T');
            await page.fill('[data-test="lastName"]', 'U');
            await page.fill('[data-test="postalCode"]', '1');
            await page.click('[data-test="continue"]');
            await expect(page.locator('.summary_subtotal_label')).toContainText('29.99');
        });

        test('31. Step 2: Tax calculation exists', async ({ page }) => {
            await page.goto(`${BASE_URL}/checkout-step-two.html`);
            await expect(page.locator('.summary_tax_label')).toContainText('$');
        });

        test('32. Step 2: Total Price sum check', async ({ page }) => {
            await page.goto(`${BASE_URL}/checkout-step-two.html`);
            await expect(page.locator('.summary_total_label')).toContainText('32.39');
        });

        test('33. Step 2: Cancel returns to inventory', async ({ page }) => {
            await page.goto(`${BASE_URL}/checkout-step-two.html`);
            await page.click('[data-test="cancel"]');
            await expect(page).toHaveURL(/inventory.html/);
        });

        test('34. Complete: Finish button creates order', async ({ page }) => {
            await page.goto(`${BASE_URL}/checkout-step-two.html`);
            await page.click('[data-test="finish"]');
            await expect(page.locator('.complete-header')).toContainText('Thank you');
        });

        test('35. Complete: Back Home button functional check', async ({ page }) => {
            await page.goto(`${BASE_URL}/checkout-complete.html`);
            await page.click('[data-test="back-to-products"]');
            await expect(page).toHaveURL(/inventory.html/);
        });
    });

    // --- SECTION 5: APP STATE & SIDEBAR 
    test.describe('Sidebar and State', () => {
        test.beforeEach(async ({ page }) => {
            await page.fill('#user-name', 'standard_user');
            await page.fill('#password', 'secret_sauce');
            await page.click('#login-button');
        });

        test('36. Sidebar opens on burger menu click', async ({ page }) => {
            await page.click('#react-burger-menu-btn');
            await expect(page.locator('.bm-menu-wrap')).toBeVisible();
        });

        test('37. Sidebar closes on cross button click', async ({ page }) => {
            await page.click('#react-burger-menu-btn');
            await page.click('#react-burger-cross-btn');
            await expect(page.locator('.bm-menu-wrap')).toBeHidden();
        });

        test('38. Reset App State clears cart badge', async ({ page }) => {
            await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
            await page.click('#react-burger-menu-btn');
            await page.click('#reset_sidebar_link');
            await expect(page.locator('.shopping_cart_badge')).toHaveCount(0);
        });

        test('39. All items link in sidebar works', async ({ page }) => {
            await page.goto(`${BASE_URL}/cart.html`);
            await page.click('#react-burger-menu-btn');
            await page.click('#inventory_sidebar_link');
            await expect(page).toHaveURL(/inventory.html/);
        });

        test('40. Error on Checkout if Cart is emptied manually', async ({ page }) => {
            await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
            await page.goto(`${BASE_URL}/cart.html`);
            await page.click('[data-test="remove-sauce-labs-backpack"]');
            await expect(page.locator('.cart_item')).toHaveCount(0);
        });
    });
});
