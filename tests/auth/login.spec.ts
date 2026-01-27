/**
 * Modern Test Example - Fixture-Based Approach
 * Industry Best Practice
 */

import { test, expect } from '../../fixtures/base';

test.describe('Authentication', () => {
    test('should login successfully with valid credentials', async ({ loginPage }) => {
        await loginPage.goto();

        await loginPage.loginViaUI(
            process.env.TEST_USER_EMAIL!,
            process.env.TEST_USER_PASSWORD!
        );

        // Assertion: verify redirect to dashboard
        await expect(loginPage.page).toHaveURL(/\/dashboard/);
    });

    test('should show error with invalid credentials', async ({ loginPage }) => {
        await loginPage.goto();

        await loginPage.loginViaUI('invalid@test.com', 'wrongpassword');

        // Assertion: error message appears
        await expect(loginPage.errorMessage).toBeVisible();
        const errorText = await loginPage.getErrorText();
        expect(errorText).toContain('Invalid');
    });

    test('should navigate to signup page', async ({ loginPage }) => {
        await loginPage.goto();

        await loginPage.signupLink.click();

        await expect(loginPage.page).toHaveURL(/\/signup/);
    });
});
