/**
 * Modern Fixture-Based Architecture
 * Industry Best Practice: Use fixtures instead of heavy beforeEach/afterEach
 * Ref: https://playwright.dev/docs/test-fixtures
 */

import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/auth/LoginPage';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { CreatePostPage } from '../pages/posts/CreatePostPage';

type TestFixtures = {
    loginPage: LoginPage;
    dashboardPage: DashboardPage;
    createPostPage: CreatePostPage;
    authenticatedPage: any; // Auto-logged-in context
};

/**
 * Base test without authentication
 */
export const test = base.extend<TestFixtures>({
    loginPage: async ({ page }, use) => {
        const loginPage = new LoginPage(page);
        await use(loginPage);
    },

    dashboardPage: async ({ page }, use) => {
        const dashboardPage = new DashboardPage(page);
        await use(dashboardPage);
    },

    createPostPage: async ({ page }, use) => {
        const createPostPage = new CreatePostPage(page);
        await use(createPostPage);
    },

    /**
     * Authenticated fixture - auto-logs in for tests that need it
     * Usage: test('my test', async ({ authenticatedPage }) => { ... })
     */
    authenticatedPage: async ({ page }, use) => {
        const loginPage = new LoginPage(page);

        // Fast login via API (bypass UI)
        await page.goto('/login');
        await loginPage.loginViaUI(
            process.env.TEST_USER_EMAIL!,
            process.env.TEST_USER_PASSWORD!
        );

        await use(page);
    },
});

export { expect } from '@playwright/test';
