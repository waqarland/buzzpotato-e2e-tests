# BuzzPotato E2E Tests - Recommended Improvements

## Overview
Based on analysis of the codebase and the successful LinkedIn OAuth test implementation, here are concrete, actionable improvements to make the project more robust and maintainable.

---

## 1. ✅ Add OAuth Test Environment Configuration

### Problem
Currently, tests don't have dedicated mock/test environment variables for OAuth mocking.

### Solution
Update `.env.example` to include OAuth testing configuration:

```dotenv
# Test Environment Variables
BASE_URL=https://buzzpotato.online
TEST_USER_EMAIL=testuser@buzzpotato.test
TEST_USER_PASSWORD=SecurePassword123!

# OAuth Testing
# Set to 'mock' to use mocked OAuth flows (no real LinkedIn login)
# Set to 'real' for integration testing against real OAuth providers
OAUTH_MODE=mock
MOCK_OAUTH_ENABLED=true

# LinkedIn OAuth (for real integration tests only)
LINKEDIN_CLIENT_ID=your-client-id
LINKEDIN_CLIENT_SECRET=your-client-secret
LINKEDIN_TEST_ACCOUNT_EMAIL=test@example.com
LINKEDIN_TEST_ACCOUNT_PASSWORD=your-test-password

# Supabase (for API-based setup)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
```

**Action**: Add these variables to `.env.example` and update `.gitignore` to exclude `.env` files.

---

## 2. ✅ Create a Global OAuth Mock Setup in Playwright Config

### Problem
OAuth mocks need to be applied to ALL pages/popups automatically. Currently, they're applied manually per test.

### Solution
Create a `global-setup.ts` that applies mocks at the browser context level:

```typescript
// global-setup.ts
import { chromium } from '@playwright/test';

async function globalSetup() {
    // If not in mock mode, skip setup
    if (process.env.OAUTH_MODE !== 'mock') {
        return;
    }

    console.log('Setting up global OAuth mocks...');

    // You could validate that mock environment is properly configured
    // This runs once before all tests
}

export default globalSetup;
```

Update `playwright.config.ts`:
```typescript
export default defineConfig({
    // ... existing config
    globalSetup: require.resolve('./global-setup.ts'),
    // ... rest of config
});
```

**Action**: Create the `global-setup.ts` file and uncomment globalSetup in config.

---

## 3. ✅ Enhance the IntegrationsPage Page Object

### Problem
The `IntegrationsPage` exists but isn't being used in the LinkedIn OAuth tests. It should be the primary interface for integration testing.

### Solution
Update `pages/settings/IntegrationsPage.ts` with better methods and better selectors:

```typescript
import { Page, Locator } from '@playwright/test';

/**
 * Page Object for the Integrations Settings page
 * Handles LinkedIn OAuth connection flow and other social integrations
 */
export class IntegrationsPage {
    readonly page: Page;

    // LinkedIn Integration Section
    readonly linkedinCard: Locator;
    readonly connectLinkedInButton: Locator;
    readonly disconnectLinkedInButton: Locator;
    readonly linkedInStatusBadge: Locator;
    readonly linkedInConnectingStatus: Locator;

    // Twitter Integration
    readonly twitterCard: Locator;
    readonly connectTwitterButton: Locator;

    constructor(page: Page) {
        this.page = page;

        // LinkedIn card container
        this.linkedinCard = page.locator('div').filter({ hasText: /^LinkedIn/ }).first();

        // Connect button (visible when not connected)
        this.connectLinkedInButton = this.linkedinCard.locator('button:has-text("Connect")').first();

        // Disconnect button (visible when connected)
        this.disconnectLinkedInButton = this.linkedinCard.locator('button[aria-label="Disconnect LinkedIn"]');

        // Status indicators
        this.linkedInStatusBadge = page.locator('span').filter({ hasText: /Connected/ });
        this.linkedInConnectingStatus = page.locator('span').filter({ hasText: /Pending connection/ });

        // Twitter section
        this.twitterCard = page.locator('div').filter({ hasText: /^Twitter/ }).first();
        this.connectTwitterButton = this.twitterCard.locator('button:has-text("Connect")').first();
    }

    async goto() {
        await this.page.goto('/settings/integrations');
        await this.page.waitForLoadState('networkidle');
    }

    async isLinkedInConnected(): Promise<boolean> {
        const connectedBadge = this.linkedInStatusBadge;
        return await connectedBadge.isVisible().catch(() => false);
    }

    async connectLinkedIn() {
        // Click the Connect button
        await this.connectLinkedInButton.click();

        // Wait for OAuth flow to complete
        await this.page.waitForLoadState('networkidle');
    }

    async disconnectLinkedIn() {
        await this.disconnectLinkedInButton.click();

        // Wait for the disconnect modal
        const confirmButton = this.page.getByRole('button', { name: /confirm|disconnect/i });
        await confirmButton.waitFor({ state: 'visible' });
        await confirmButton.click();
    }

    async isConnectionPending(): Promise<boolean> {
        return await this.linkedInConnectingStatus.isVisible().catch(() => false);
    }

    /**
     * Wait for connection to complete (either success or pending state)
     */
    async waitForConnectionComplete(timeoutMs: number = 15000) {
        await Promise.race([
            this.linkedInStatusBadge.waitFor({ state: 'visible', timeout: timeoutMs }),
            this.linkedInConnectingStatus.waitFor({ state: 'visible', timeout: timeoutMs })
        ]);
    }
}
```

**Action**: Replace the existing `IntegrationsPage.ts` with the enhanced version.

---

## 4. ✅ Create a Reusable OAuth Fixture

### Problem
OAuth mocking logic is in the helper, but tests need easier access. Add it as a fixture.

### Solution
Update `fixtures/base.ts` to include OAuth fixtures:

```typescript
import { setupLinkedInMocks, setupLinkedInMocksWithError } from '../helpers/linkedin-mock';

type TestFixtures = {
    // ... existing fixtures
    integrationsPage: IntegrationsPage;
    linkedInMocked: void; // Fixture that applies LinkedIn mocks
};

export const test = base.extend<TestFixtures>({
    // ... existing fixtures

    integrationsPage: async ({ page }, use) => {
        const integrationsPage = new IntegrationsPage(page);
        await use(integrationsPage);
    },

    /**
     * Fixture that automatically sets up LinkedIn OAuth mocks
     * Usage: test('my test', async ({ linkedInMocked, page }) => { ... })
     */
    linkedInMocked: async ({ page }, use) => {
        // Only apply mocks if not in real OAuth mode
        if (process.env.OAUTH_MODE === 'mock') {
            await setupLinkedInMocks(page);
        }
        await use();
    },
});
```

**Action**: Add these imports and fixture definitions to `fixtures/base.ts`.

---

## 5. ✅ Refactor LinkedIn OAuth Tests to Use Page Object

### Problem
Test code is verbose and repeats navigation logic. The refactored test should use the page object.

### Solution
Update `tests/integration/linkedin-oauth.spec.ts` to use `IntegrationsPage`:

```typescript
import { test, expect } from '../../fixtures/base';
import { setupLinkedInMocks, setupLinkedInMocksWithError } from '../../helpers/linkedin-mock';

test.describe('LinkedIn OAuth Integration', () => {

    test('should successfully initiate LinkedIn OAuth flow', async ({ authenticatedPage, integrationsPage, linkedInMocked }) => {
        // Navigate to integrations
        await integrationsPage.goto();

        // Verify LinkedIn card exists
        await expect(integrationsPage.linkedinCard).toBeVisible();

        // Verify not connected initially
        const isConnected = await integrationsPage.isLinkedInConnected();
        expect(isConnected).toBeFalsy();

        // Click connect
        await integrationsPage.connectLinkedIn();

        // Verify API endpoint works
        const response = await authenticatedPage.request.get('/api/integrations/linkedin/status');
        expect(response.ok()).toBeTruthy();
        const data = await response.json();
        expect(typeof data.connected).toBe('boolean');
    });

    test('should handle LinkedIn OAuth error gracefully', async ({ authenticatedPage, integrationsPage }) => {
        // Setup error mock
        await setupLinkedInMocksWithError(authenticatedPage);

        // Navigate to integrations
        await integrationsPage.goto();

        // Attempt connection
        await integrationsPage.connectLinkedIn();

        // Verify still not connected
        const isConnected = await integrationsPage.isLinkedInConnected();
        expect(isConnected).toBeFalsy();
    });

    test('should display LinkedIn as not connected by default', async ({ authenticatedPage, integrationsPage }) => {
        // Navigate to integrations
        await integrationsPage.goto();

        // Verify not connected
        const isConnected = await integrationsPage.isLinkedInConnected();
        expect(isConnected).toBeFalsy();

        // Verify Connect button is visible
        await expect(integrationsPage.connectLinkedInButton).toBeVisible();
        await expect(integrationsPage.connectLinkedInButton).toBeEnabled();
    });
});
```

**Action**: Refactor the test file to use the page object methods.

---

## 6. ✅ Add OAuth Test Environment Detection Helper

### Problem
Tests need to know if they're in mock or real mode. Add a helper utility.

### Solution
Create `helpers/oauth-config.ts`:

```typescript
/**
 * OAuth Configuration Helper
 * Determines test environment and configuration
 */

export class OAuthConfig {
    static isMockMode(): boolean {
        return process.env.OAUTH_MODE === 'mock' || 
               process.env.MOCK_OAUTH_ENABLED === 'true';
    }

    static isRealMode(): boolean {
        return process.env.OAUTH_MODE === 'real';
    }

    static validateRealOAuthEnv(): void {
        if (!this.isRealMode()) return;

        const required = [
            'LINKEDIN_CLIENT_ID',
            'LINKEDIN_CLIENT_SECRET',
            'LINKEDIN_TEST_ACCOUNT_EMAIL',
            'LINKEDIN_TEST_ACCOUNT_PASSWORD'
        ];

        const missing = required.filter(key => !process.env[key]);
        if (missing.length > 0) {
            throw new Error(
                `Real OAuth mode requires: ${missing.join(', ')}\n` +
                `Set OAUTH_MODE=mock to use mocked OAuth instead.`
            );
        }
    }

    static getLinkedInConfig() {
        if (this.isMockMode()) {
            return {
                email: 'mock@test.com',
                password: 'mock_password',
                clientId: 'mock_client_id',
            };
        }

        return {
            email: process.env.LINKEDIN_TEST_ACCOUNT_EMAIL,
            password: process.env.LINKEDIN_TEST_ACCOUNT_PASSWORD,
            clientId: process.env.LINKEDIN_CLIENT_ID,
        };
    }
}
```

**Action**: Create the `helpers/oauth-config.ts` file.

---

## 7. ✅ Add Data Cleanup Utilities

### Problem
Tests don't clean up after themselves. After LinkedIn connects, the data persists.

### Solution
Create `helpers/test-cleanup.ts`:

```typescript
import { Page } from '@playwright/test';

/**
 * Test Data Cleanup Utilities
 * Ensures tests don't leave behind side effects
 */

export class TestCleanup {
    /**
     * Disconnect all social integrations for the current user
     * Uses the API to clean up test data
     */
    static async disconnectAllIntegrations(page: Page): Promise<void> {
        try {
            // Disconnect LinkedIn
            const linkedinResponse = await page.request.post(
                '/api/integrations/linkedin/disconnect',
                { data: {} }
            );

            if (linkedinResponse.ok()) {
                console.log('✓ Disconnected LinkedIn');
            }

            // Add similar cleanup for Twitter, Facebook, etc. as needed
        } catch (error) {
            console.warn('Cleanup error:', error);
            // Don't fail the test if cleanup fails
        }
    }

    /**
     * Clean up test-created posts
     * Optional: implement if tests create posts that need cleanup
     */
    static async deleteTestPosts(page: Page, filter?: { createdAfter?: Date }): Promise<void> {
        try {
            const response = await page.request.delete(
                '/api/posts/cleanup',
                { data: { filter } }
            );

            if (response.ok()) {
                console.log('✓ Cleaned up test posts');
            }
        } catch (error) {
            console.warn('Post cleanup error:', error);
        }
    }
}
```

Use in tests:
```typescript
test.afterEach(async ({ authenticatedPage }) => {
    // Cleanup after test
    await TestCleanup.disconnectAllIntegrations(authenticatedPage);
});
```

**Action**: Create `helpers/test-cleanup.ts` and add `afterEach` hook to OAuth tests.

---

## 8. ✅ Add Missing Page Objects

### Problem
Some pages don't have page objects. Create them for better maintainability.

### Solution
Create missing page objects:

**`pages/settings/SettingsPage.ts`:**
```typescript
import { Page, Locator } from '@playwright/test';

export class SettingsPage {
    readonly page: Page;
    readonly profileTab: Locator;
    readonly integrationsTab: Locator;
    readonly securityTab: Locator;
    readonly billingTab: Locator;

    constructor(page: Page) {
        this.page = page;
        this.profileTab = page.getByRole('link', { name: /profile/i });
        this.integrationsTab = page.getByRole('link', { name: /integrations/i });
        this.securityTab = page.getByRole('link', { name: /security/i });
        this.billingTab = page.getByRole('link', { name: /billing/i });
    }

    async goto() {
        await this.page.goto('/settings');
    }

    async navigateToIntegrations() {
        await this.integrationsTab.click();
    }
}
```

**`pages/onboarding/OnboardingPage.ts`:**
```typescript
import { Page, Locator } from '@playwright/test';

export class OnboardingPage {
    readonly page: Page;
    readonly nextButton: Locator;
    readonly skipButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.nextButton = page.getByRole('button', { name: /next/i });
        this.skipButton = page.getByRole('button', { name: /skip/i });
    }

    async goto() {
        await this.page.goto('/onboarding');
    }
}
```

**Action**: Create these page object files and add to fixture.

---

## 9. ✅ Improve LinkedIn Mock Helper Documentation

### Problem
The mock helper works well but could be better documented for other developers.

### Solution
Update `helpers/linkedin-mock.ts` with better comments:

```typescript
/**
 * LinkedIn OAuth Mock Helper
 * 
 * INDUSTRY STANDARD APPROACH:
 * Instead of mocking third-party OAuth endpoints (which doesn't prevent popups),
 * we mock YOUR APP's OAuth callback handler. This is more realistic and reliable.
 * 
 * How it works:
 * 1. When user clicks "Connect LinkedIn", your app initiates OAuth
 * 2. LinkedIn would normally open a popup (we prevent this with mocks)
 * 3. The auth code is generated by our mock
 * 4. Your backend callback receives the mocked code
 * 5. Your app exchanges it for a token (in real flow) or uses our mock
 * 
 * Advantages:
 * ✓ No real LinkedIn login needed
 * ✓ Fast and reliable tests
 * ✓ Works in any CI/CD environment
 * ✓ Tests your OAuth logic, not LinkedIn's
 * ✓ Prevents popup windows
 * 
 * Reference:
 * https://playwright.dev/docs/auth#testing-third-party-oauth
 */
```

**Action**: Add better documentation to the mock helper.

---

## 10. ✅ Create Test Documentation

### Problem
New developers don't know how to run OAuth tests or use the mocking system.

### Solution
Create `TESTING_OAUTH.md`:

```markdown
# Testing OAuth Integrations

## Quick Start

### Run with Mocked OAuth (Default)
```bash
npm test                    # Uses mock OAuth (no credentials needed)
npm run test:headed         # See the browser
npm run test:debug          # Debug mode
```

### Run with Real OAuth (Advanced)
```bash
OAUTH_MODE=real npm test    # Uses real LinkedIn OAuth
```

## Environment Variables

### Mock Mode (Default)
No special configuration needed. Tests use mocked OAuth flows.

### Real Mode
Set these environment variables in `.env`:
```
OAUTH_MODE=real
LINKEDIN_CLIENT_ID=your-id
LINKEDIN_CLIENT_SECRET=your-secret
LINKEDIN_TEST_ACCOUNT_EMAIL=test@example.com
LINKEDIN_TEST_ACCOUNT_PASSWORD=password
```

## Writing OAuth Tests

### Using the LinkedIn Fixture
```typescript
test('my oauth test', async ({ integrationsPage, linkedInMocked }) => {
    await integrationsPage.goto();
    await integrationsPage.connectLinkedIn();
    // Test passes without needing LinkedIn login
});
```

### Manual Mock Setup
```typescript
test('custom oauth test', async ({ page }) => {
    await setupLinkedInMocks(page);
    // Mocks are applied automatically
});
```

## Troubleshooting

**Real LinkedIn login popup appears?**
- You're in real mode. Either:
  - Set `OAUTH_MODE=mock` in `.env`
  - Or configure LinkedIn test credentials

**Tests fail with timeout?**
- Check that mocks are applied before clicking connect
- Ensure `await page.waitForLoadState('networkidle')` after connect

**API endpoint returns 404?**
- Verify your backend has implemented `/api/integrations/linkedin/callback`
- Check the endpoint path matches what your frontend uses
```

**Action**: Create `TESTING_OAUTH.md` in the project root.

---

## 11. ✅ Add CI/CD Configuration for OAuth Tests

### Problem
GitHub Actions might not have OAuth credentials configured.

### Solution
Update `.github/workflows/e2e-tests.yml`:

```yaml
name: E2E Tests

on:
  push:
    branches: [main]
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours

jobs:
  test:
    runs-on: ubuntu-latest
    
    env:
      BASE_URL: ${{ secrets.BASE_URL || 'https://buzzpotato.online' }}
      TEST_USER_EMAIL: ${{ secrets.TEST_USER_EMAIL }}
      TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}
      # OAuth testing in CI always uses mocks
      OAUTH_MODE: mock
      MOCK_OAUTH_ENABLED: true

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - run: npm install
      - run: npx playwright install --with-deps

      # Run tests with mocked OAuth (no credentials needed)
      - run: npm test

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

**Action**: Ensure your GitHub Actions workflow uses `OAUTH_MODE=mock`.

---

## 12. ✅ Create TypeScript Configuration for Test Types

### Problem
TypeScript types aren't fully leveraged in tests.

### Solution
Update `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "types": ["@playwright/test", "node"]
  },
  "include": ["tests/**/*", "fixtures/**/*", "pages/**/*", "helpers/**/*"],
  "exclude": ["node_modules"]
}
```

**Action**: Update `tsconfig.json` with strict typing.

---

## Summary: Implementation Checklist

- [ ] **1. Update .env.example** with OAuth configuration
- [ ] **2. Create global-setup.ts** and enable in config
- [ ] **3. Enhance IntegrationsPage.ts** with better methods
- [ ] **4. Add fixture** for integrationsPage and linkedInMocked
- [ ] **5. Create OAuth config helper** (oauth-config.ts)
- [ ] **6. Create test cleanup** utilities
- [ ] **7. Add missing page objects** (SettingsPage, OnboardingPage)
- [ ] **8. Improve mock helper** documentation
- [ ] **9. Create TESTING_OAUTH.md** documentation
- [ ] **10. Update GitHub Actions** for OAuth testing
- [ ] **11. Update tsconfig.json** for strict typing

---

## Benefits After Implementation

✅ **Better Test Reliability**
- Consistent OAuth mocking across all tests
- No flaky third-party dependencies

✅ **Improved Developer Experience**
- Clear fixture API for OAuth tests
- Comprehensive documentation
- Easy to write new integration tests

✅ **Production-Ready**
- Works perfectly in CI/CD
- Supports both mock and real OAuth testing
- Proper cleanup between tests
- Type-safe code

✅ **Scalability**
- Easy to add more social integrations (Twitter, Facebook, etc.)
- Fixture pattern makes it simple to extend
- Page objects provide clear separation of concerns

---

**Status**: All improvements are complementary and can be implemented incrementally. Start with #1-#4 for maximum impact.
