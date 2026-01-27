/**
 * Smoke Test - Authentication Flow
 * Tests that require user login
 */

import { test, expect } from '../../fixtures/base';

test.describe('Authentication Smoke Tests', () => {
    test('User can login successfully', async ({ authenticatedPage }) => {
        // Already logged in via fixture

        // Verify we're on dashboard or onboarding
        expect(authenticatedPage.url()).toMatch(/\/(dashboard|onboarding)/);

        // Take screenshot as proof
        await authenticatedPage.screenshot({ path: 'test-results/logged-in-page.png' });
    });
});
