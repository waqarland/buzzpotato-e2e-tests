/**
 * Simple Smoke Tests - No Authentication Required
 * Verifies basic page loads and navigation
 */

import { test, expect } from '../../fixtures/base';

test.describe('Basic Smoke Tests', () => {
    test('Login page loads successfully', async ({ page }) => {
        await page.goto('/login');

        // Verify page loaded
        await expect(page).toHaveTitle(/BuzzPotato/i);

        // Verify login form is present
        await expect(page.locator('#email')).toBeVisible();
        await expect(page.locator('#password')).toBeVisible();
        await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test('Signup link navigates to signup page', async ({ page }) => {
        await page.goto('/login');

        await page.locator('a[href="/signup"]').click();

        await expect(page).toHaveURL(/\/signup/);
    });
});
