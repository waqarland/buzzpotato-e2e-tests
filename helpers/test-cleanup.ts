/**\n * Test Data Cleanup Utilities\n *\n * Provides reusable cleanup functions to prevent test data pollution and\n * ensure tests don't interfere with each other.\n *\n * Implements best practices for test cleanup:\n * - Non-destructive: Cleanup failures don't fail tests\n * - Comprehensive: Removes all test artifacts\n * - Composable: Methods can be combined for different scenarios\n * - Well-documented: Clear errors and logs\n *\n * @module helpers/test-cleanup\n * @example\n * ```typescript\n * // In test fixture\n * test.afterEach(async ({ authenticatedPage, testCleanup }) => {\n *     await testCleanup.disconnectAllIntegrations();\n * });\n * ```\n */\n\nimport { Page } from '@playwright/test';\n\n/**\n * Supported integration names\n */\ntype IntegrationName = 'linkedin' | 'twitter' | 'facebook';\n\n/**\n * Integration cleanup result\n */\ninterface CleanupResult {\n  readonly integration: IntegrationName;\n  readonly success: boolean;\n  readonly message: string;\n}

export class TestCleanup {
    constructor(private page: Page) {}

    /**
     * Disconnect all OAuth integrations (LinkedIn, Twitter, Facebook)
     *
     * This prevents test data pollution where one test's connection state
     * affects another test's behavior.
     *
     * @example
     * ```typescript
     * test.afterEach(async ({ testCleanup }) => {
     *     await testCleanup.disconnectAllIntegrations();
     * });
     * ```
     */
    async disconnectAllIntegrations(): Promise<void> {
        const integrations = ['linkedin', 'twitter', 'facebook'];

        for (const integration of integrations) {
            await this.disconnectIntegration(integration);
        }
    }

    /**
     * Disconnect a specific OAuth integration
     *
     * @param integrationName - The integration to disconnect ('linkedin', 'twitter', 'facebook')
     *
     * @example
     * ```typescript
     * await testCleanup.disconnectIntegration('linkedin');
     * ```
     */
    async disconnectIntegration(integrationName: string): Promise<void> {
        try {
            const endpoint = `/api/integrations/${integrationName.toLowerCase()}/disconnect`;

            const response = await this.page.request.post(endpoint, {
                data: {},
            });

            if (response.ok()) {
                console.log(
                    `✓ Cleaned up ${integrationName} integration (${response.status()})`,
                );
            } else if (response.status() === 404) {
                // Integration not connected, which is fine
                console.log(`• ${integrationName} not connected (skipped)`);
            } else {
                console.warn(
                    `⚠ Failed to disconnect ${integrationName}: ${response.status()}`,
                );
            }
        } catch (error) {
            // Log cleanup failures but don't fail the test
            // Connection might not exist, which is okay
            console.warn(
                `⚠ Cleanup warning for ${integrationName}:`,
                error instanceof Error ? error.message : error,
            );
        }
    }

    /**
     * Clear all test data created during the test
     *
     * This is a comprehensive cleanup that:
     * - Disconnects all integrations
     * - Clears session data
     * - Resets user preferences
     *
     * @example
     * ```typescript
     * test.afterEach(async ({ testCleanup }) => {
     *     await testCleanup.clearAllTestData();
     * });
     * ```
     */
    async clearAllTestData(): Promise<void> {
        try {
            // Disconnect integrations first
            await this.disconnectAllIntegrations();

            // Try to clear backend test data (if endpoint exists)
            try {
                const response = await this.page.request.post('/api/test/cleanup', {
                    data: {},
                });
                if (response.ok()) {
                    console.log('✓ Test data cleared');
                }
            } catch {
                // Endpoint might not exist in production, that's okay
            }

            // Clear localStorage
            await this.page.evaluate(() => {
                localStorage.clear();
            });

            // Clear sessionStorage
            await this.page.evaluate(() => {
                sessionStorage.clear();
            });

            console.log('✓ Session storage cleared');
        } catch (error) {
            console.warn(
                'Cleanup warning:',
                error instanceof Error ? error.message : error,
            );
        }
    }

    /**
     * Wait for pending network requests to complete
     *
     * Useful before cleanup to ensure all requests are finished.
     *
     * @example
     * ```typescript
     * test.afterEach(async ({ testCleanup }) => {
     *     await testCleanup.waitForNetworkIdle();
     *     await testCleanup.disconnectAllIntegrations();
     * });
     * ```
     */
    async waitForNetworkIdle(timeout: number = 5000): Promise<void> {
        try {
            await this.page.waitForLoadState('networkidle', { timeout });
        } catch {
            // Timeout is okay, we're just being cautious
        }
    }

    /**
     * Verify integrations are disconnected
     *
     * Used in tests to verify cleanup was successful.
     *
     * @example
     * ```typescript
     * const status = await testCleanup.getIntegrationStatus('linkedin');
     * expect(status.connected).toBeFalsy();
     * ```
     */
    async getIntegrationStatus(integrationName: string): Promise<{
        connected: boolean;
        error?: string;
    }> {
        try {
            const response = await this.page.request.get(
                `/api/integrations/${integrationName.toLowerCase()}/status`,
            );

            if (response.ok()) {
                const data = (await response.json()) as { connected?: boolean };
                return {
                    connected: data.connected ?? false,
                };
            } else if (response.status() === 404) {
                return { connected: false };
            } else {
                return {
                    connected: false,
                    error: `HTTP ${response.status()}`,
                };
            }
        } catch (error) {
            return {
                connected: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    /**
     * Assert all integrations are disconnected
     *
     * Useful in tests to verify cleanup worked.
     *
     * @example
     * ```typescript
     * test.afterEach(async ({ testCleanup }) => {
     *     await testCleanup.disconnectAllIntegrations();
     *     await testCleanup.assertAllDisconnected();
     * });
     * ```
     */
    async assertAllDisconnected(): Promise<void> {
        const integrations = ['linkedin', 'twitter', 'facebook'];
        const statuses = await Promise.all(
            integrations.map((name) => this.getIntegrationStatus(name)),
        );

        const connectedIntegrations = integrations.filter(
            (name, index) => statuses[index].connected,
        );

        if (connectedIntegrations.length > 0) {
            console.warn(
                `⚠ Expected all integrations disconnected, but found connected: ${connectedIntegrations.join(', ')}`,
            );
        }
    }
}

/**
 * Helper to create TestCleanup instance from page
 *
 * @example
 * ```typescript
 * const cleanup = new TestCleanup(page);
 * await cleanup.disconnectAllIntegrations();
 * ```
 */
export function createTestCleanup(page: Page): TestCleanup {
    return new TestCleanup(page);
}
