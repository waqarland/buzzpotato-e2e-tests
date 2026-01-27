/**
 * Debug Authentication Test
 * This will help us see what's happening during login
 */

import { test, expect } from '@playwright/test';

test('Debug: Manual login test', async ({ page }) => {
    await page.goto('https://buzzpotato.online/login');

    // Fill in credentials
    await page.locator('#email').fill('testuser@buzzpotato.test');
    await page.locator('#password').fill('TestPassword123!');

    // Click login
    await page.locator('button[type="submit"]').filter({ hasText: 'Sign In' }).click();

    // Wait a bit and see where we end up
    await page.waitForTimeout(5000);

    console.log('Current URL:', page.url());
    console.log('Page title:', await page.title());

    // Take screenshot
    await page.screenshot({ path: 'test-results/after-login.png', fullPage: true });

    // Check if there's an error message
    const errorElement = page.locator('.bg-red-500\\/10');
    if (await errorElement.isVisible()) {
        const errorText = await errorElement.textContent();
        console.log('Error message:', errorText);
    }

    // This test is just for debugging - we'll see the output
});
