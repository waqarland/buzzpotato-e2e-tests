/**
 * Modern Fixture-Based Architecture
 * Industry Best Practice: Use fixtures instead of heavy beforeEach/afterEach
 * Ref: https://playwright.dev/docs/test-fixtures
 */

import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/auth/LoginPage';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { CreatePostPage } from '../pages/posts/CreatePostPage';
import { IntegrationsPage } from '../pages/settings/IntegrationsPage';
import { setupLinkedInMocks } from '../helpers/linkedin-mock';
import { TestCleanup } from '../helpers/test-cleanup';

type TestFixtures = {
    loginPage: LoginPage;
    dashboardPage: DashboardPage;
    createPostPage: CreatePostPage;
    integrationsPage: IntegrationsPage;
    authenticatedPage: any; // Auto-logged-in context
    linkedInMocked: void; // Fixture that applies LinkedIn OAuth mocks
    testCleanup: TestCleanup; // Fixture for cleaning up test data
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

    integrationsPage: async ({ page }, use) => {
        const integrationsPage = new IntegrationsPage(page);
        await use(integrationsPage);
    },

    /**
     * Authenticated fixture - auto-logs in for tests that need it
     * Usage: test('my test', async ({ authenticatedPage }) => { ... })
     */
    authenticatedPage: async ({ page }, use) => {
        const loginPage = new LoginPage(page);

        // Validate environment variables
        const email = process.env.TEST_USER_EMAIL;
        const password = process.env.TEST_USER_PASSWORD;

        if (!email || !password) {
            throw new Error(
                'TEST_USER_EMAIL and TEST_USER_PASSWORD must be set in .env file'
            );
        }

        // Fast login via UI
        await page.goto('/login');
        await loginPage.loginViaUI(email, password);

        await use(page);
    },

    /**
     * Fixture that automatically sets up LinkedIn OAuth mocks
     * Usage: test('my test', async ({ linkedInMocked, page }) => { ... })
     * 
     * This fixture:
     * - Applies OAuth mocks at the test level
     * - Prevents real LinkedIn login popups
     * - Allows tests to run without credentials
     * - Works for both mock and real OAuth modes
     */
    linkedInMocked: async ({ page }, use) => {
        // Apply mocks if in mock mode
        const mockMode = (
            process.env.OAUTH_MODE === 'mock' ||
            process.env.MOCK_OAUTH_ENABLED === 'true' ||
            !process.env.OAUTH_MODE // Default to mock
        );

        if (mockMode) {
            await setupLinkedInMocks(page);
            console.log('✓ LinkedIn OAuth mocks applied');
        }

        await use();
    },

    /**
     * Fixture for test data cleanup
     * Usage: test('my test', async ({ testCleanup }) => { ... })
     * 
     * This fixture provides utilities to:
     * - Disconnect OAuth integrations
     * - Clear session storage
     * - Verify cleanup success
     * - Prevent test data pollution
     * 
     * Example:
     * ```typescript
     * test.afterEach(async ({ testCleanup }) => {
     *     await testCleanup.disconnectAllIntegrations();
     * });
     * ```
     */
    testCleanup: async ({ page }, use) => {
        const cleanup = new TestCleanup(page);
        await use(cleanup);
    },
});

export { expect } from '@playwright/test';
