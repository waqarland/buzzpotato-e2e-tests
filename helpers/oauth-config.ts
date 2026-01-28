/**
 * OAuth Configuration Helper
 * Determines test environment and OAuth configuration
 * 
 * Supports two modes:
 * - mock: Uses mocked OAuth flows (default, no credentials needed)
 * - real: Uses real OAuth providers (requires credentials)
 */

export class OAuthConfig {
    /**
     * Check if running in mock OAuth mode
     * This uses mocked OAuth endpoints and doesn't require real credentials
     */
    static isMockMode(): boolean {
        return (
            process.env.OAUTH_MODE === 'mock' ||
            process.env.MOCK_OAUTH_ENABLED === 'true' ||
            !process.env.OAUTH_MODE // Default to mock if not specified
        );
    }

    /**
     * Check if running in real OAuth mode
     * This uses actual OAuth providers and requires credentials
     */
    static isRealMode(): boolean {
        return process.env.OAUTH_MODE === 'real';
    }

    /**
     * Validate that real OAuth environment is properly configured
     * Throws an error if required variables are missing
     */
    static validateRealOAuthEnv(): void {
        if (!this.isRealMode()) return;

        const required = [
            'LINKEDIN_CLIENT_ID',
            'LINKEDIN_CLIENT_SECRET',
            'LINKEDIN_TEST_ACCOUNT_EMAIL',
            'LINKEDIN_TEST_ACCOUNT_PASSWORD',
        ];

        const missing = required.filter((key) => !process.env[key]);

        if (missing.length > 0) {
            throw new Error(
                `Real OAuth mode requires these environment variables: ${missing.join(', ')}\n\n` +
                    `To fix:\n` +
                    `1. Set ${missing.map((v) => `${v}=...`).join(', ')} in .env\n` +
                    `2. Or set OAUTH_MODE=mock to use mocked OAuth (recommended for testing)`
            );
        }
    }

    /**
     * Get LinkedIn OAuth configuration based on current mode
     */
    static getLinkedInConfig() {
        if (this.isMockMode()) {
            return {
                mode: 'mock' as const,
                email: 'mock@test.com',
                password: 'mock_password',
                clientId: 'mock_client_id',
            };
        }

        // Real mode
        return {
            mode: 'real' as const,
            email: process.env.LINKEDIN_TEST_ACCOUNT_EMAIL!,
            password: process.env.LINKEDIN_TEST_ACCOUNT_PASSWORD!,
            clientId: process.env.LINKEDIN_CLIENT_ID!,
        };
    }

    /**
     * Log the current OAuth configuration (useful for debugging)
     */
    static logConfiguration(): void {
        const mode = this.isMockMode() ? 'MOCK' : 'REAL';
        console.log(`\n🔐 OAuth Testing Mode: ${mode}`);

        if (this.isMockMode()) {
            console.log('   ✓ Using mocked OAuth flows');
            console.log('   ✓ No real LinkedIn login needed');
            console.log('   ✓ Tests run offline-friendly\n');
        } else {
            console.log('   ✓ Using real OAuth providers');
            console.log('   ⚠️  Requires valid credentials\n');
        }
    }
}
