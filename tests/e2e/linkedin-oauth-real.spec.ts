import { test, expect } from '../../fixtures/base';

/**
 * LinkedIn OAuth E2E Test - Real Account Integration
 * 
 * This test uses REAL LinkedIn credentials to verify the complete OAuth flow.
 * 
 * Requirements:
 * - LINKEDIN_TEST_EMAIL in .env
 * - LINKEDIN_TEST_PASSWORD in .env
 * - Valid LinkedIn test account
 * 
 * Usage:
 * - Run manually: npx playwright test tests/e2e/linkedin-oauth-real.spec.ts --headed
 * - Tag-based: npx playwright test --grep @e2e
 * - CI/CD: Only runs when secrets are configured
 * 
 * Note: This test takes ~2-3 minutes due to real LinkedIn OAuth
 */
test.describe('LinkedIn OAuth E2E - Real Account @e2e', () => {

    test.beforeEach(async () => {
        // Verify environment variables are set
        if (!process.env.LINKEDIN_TEST_EMAIL || !process.env.LINKEDIN_TEST_PASSWORD) {
            throw new Error(
                'LinkedIn test credentials not found! Please set:\n' +
                '- LINKEDIN_TEST_EMAIL\n' +
                '- LINKEDIN_TEST_PASSWORD\n' +
                'in your .env file or CI/CD secrets'
            );
        }
    });

    test('should successfully connect real LinkedIn account via OAuth popup', async ({ context, page, authenticatedPage }) => {
        await test.step('Navigate to Integrations page', async () => {
            // After login, navigate through UI
            await page.waitForLoadState('networkidle');

            // Click user avatar
            const header = page.locator('header');
            const userAvatarLink = header.locator('a[href="/settings"]').first();
            await userAvatarLink.waitFor({ state: 'visible', timeout: 15000 });
            await userAvatarLink.click();

            // Verify on settings page
            await expect(page).toHaveURL('/settings', { timeout: 10000 });

            // Click Integrations button
            const integrationsButton = page.locator('a[href="/settings/integrations"]').filter({ hasText: 'Integrations' });
            await integrationsButton.click();

            // Verify on integrations page
            await expect(page).toHaveURL('/settings/integrations');
            await expect(page.getByRole('heading', { name: /connected accounts/i })).toBeVisible();
        });

        await test.step('Verify LinkedIn is not connected initially', async () => {
            const linkedinCard = page.locator('div').filter({ hasText: /LinkedIn/ }).first();
            const connectButton = linkedinCard.locator('button:has-text("Connect")').first();
            await expect(connectButton).toBeVisible({ timeout: 10000 });
        });

        await test.step('Handle LinkedIn OAuth popup login', async () => {
            // Set up popup listener BEFORE clicking Connect
            const popupPromise = context.waitForEvent('page');

            // Click Connect LinkedIn button
            const linkedinCard = page.locator('div').filter({ hasText: /LinkedIn/ }).first();
            const connectButton = linkedinCard.locator('button:has-text("Connect")').first();
            await connectButton.click();

            // Wait for LinkedIn OAuth popup to open
            const popup = await popupPromise;
            await popup.waitForLoadState('domcontentloaded', { timeout: 30000 });

            // LinkedIn login page selectors (these may need adjustment if LinkedIn changes their UI)
            try {
                // Wait for username field - try multiple selectors
                const usernameField = popup.locator('input[id="username"], input[name="session_key"], input[type="email"], input[placeholder*="email"], input[placeholder*="Email"]').first();
                await usernameField.waitFor({ state: 'visible', timeout: 15000 });
                console.log('✓ Username field found, entering email...');
                await usernameField.fill(process.env.LINKEDIN_TEST_EMAIL!);
                await usernameField.press('Tab'); // Move to next field

                // Fill password - try multiple selectors
                const passwordField = popup.locator('input[id="password"], input[name="session_password"], input[type="password"], input[placeholder*="password"], input[placeholder*="Password"]').first();
                await passwordField.waitFor({ state: 'visible', timeout: 5000 });
                console.log('✓ Password field found, entering password...');
                await passwordField.fill(process.env.LINKEDIN_TEST_PASSWORD!);

                // Click Sign In button - try multiple selectors
                const signInButton = popup.locator('button:has-text("Sign in"), button[type="submit"]:visible, button[aria-label*="Sign in"]').first();
                await signInButton.waitFor({ state: 'visible', timeout: 5000 });
                console.log('✓ Sign in button found, clicking...');
                await signInButton.click();

                // Wait for popup to close after successful auth
                // LinkedIn redirects back to your callback, which closes the popup
                await popup.waitForEvent('close', { timeout: 30000 });
                console.log('✓ LinkedIn popup closed successfully');

            } catch (error) {
                // Take screenshot for debugging if login fails
                await popup.screenshot({ path: 'test-results/linkedin-login-error.png' });
                console.log('✗ LinkedIn login failed, screenshot saved to test-results/linkedin-login-error.png');
                throw new Error(`LinkedIn login failed: ${error}`);
            }
        });

        await test.step('Verify connection success in main window', async () => {
            // Wait for the popup to close and page to refresh
            await page.waitForLoadState('networkidle', { timeout: 30000 });

            // Refresh page to ensure we see latest state
            await page.reload();
            await page.waitForLoadState('networkidle');

            // Check if Connected badge appears
            const connectedBadge = page.locator('span').filter({ hasText: /^Connected$/ }).first();
            const isConnected = await connectedBadge.isVisible({ timeout: 5000 }).catch(() => false);

            if (isConnected) {
                console.log('✓ LinkedIn successfully connected!');
                
                // Verify API reports connection
                const response = await page.request.get('/api/integrations/linkedin/status');
                expect(response.ok()).toBeTruthy();

                const data = await response.json();
                expect(data.connected).toBe(true);
            } else {
                // If badge not visible, check if it was connection already existed
                const linkedinCard = page.locator('div').filter({ hasText: /LinkedIn/ }).first();
                const connectButton = linkedinCard.locator('button:has-text("Connect")').first();
                const buttonVisible = await connectButton.isVisible().catch(() => false);
                
                if (buttonVisible) {
                    throw new Error('LinkedIn connection failed - Connect button still visible after OAuth flow');
                } else {
                    console.log('✓ LinkedIn is connected (verified by missing Connect button)');
                }
            }
        });
    });

    test('should disconnect LinkedIn account', async ({ page, authenticatedPage }) => {
        await test.step('Navigate to Integrations', async () => {
            const header = page.locator('header');
            await header.locator('a[href="/settings"]').first().click();
            await expect(page).toHaveURL('/settings');

            await page.locator('a[href="/settings/integrations"]').click();
            await expect(page).toHaveURL('/settings/integrations');
        });

        await test.step('Skip if not connected', async () => {
            const connectedBadge = page.locator('span').filter({ hasText: /^Connected$/ });
            const isConnected = await connectedBadge.isVisible().catch(() => false);

            if (!isConnected) {
                test.skip();
            }
        });

        await test.step('Disconnect LinkedIn', async () => {
            const linkedinCard = page.locator('div').filter({ hasText: /LinkedIn/ }).first();
            const disconnectButton = linkedinCard.locator('button:has-text("Disconnect"), button[aria-label*="Disconnect"]').first();
            await disconnectButton.waitFor({ state: 'visible', timeout: 10000 });
            await disconnectButton.click();

            // Confirm in modal
            const confirmButton = page.getByRole('button', { name: /confirm|disconnect/i });
            await confirmButton.waitFor({ state: 'visible' });
            await confirmButton.click();

            // Verify disconnected - Connect button should reappear
            const connectButton = linkedinCard.locator('button:has-text("Connect")').first();
            await expect(connectButton).toBeVisible({ timeout: 10000 });
        });
    });
});
