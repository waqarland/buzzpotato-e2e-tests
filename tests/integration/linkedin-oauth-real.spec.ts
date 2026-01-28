import { test, expect } from '../../fixtures/base';

/**
 * Real LinkedIn OAuth Integration Tests
 * These tests use actual LinkedIn credentials for end-to-end validation
 * 
 * Setup:
 * 1. Set OAUTH_MODE=real in .env
 * 2. Provide valid LinkedIn credentials:
 *    - LINKEDIN_TEST_EMAIL
 *    - LINKEDIN_TEST_PASSWORD
 * 
 * Run: npx playwright test tests/integration/linkedin-oauth-real.spec.ts --headed
 */

test.describe('Real LinkedIn OAuth Integration', () => {
    
    test('should connect to LinkedIn with real credentials', async ({ page, authenticatedPage }) => {
        await test.step('Navigate to Integrations page', async () => {
            console.log('📱 Navigating to Integrations page...');
            
            // Click user avatar
            await page.getByRole('link', { name: /avatar/i }).click();
            
            // Click Integrations link
            await page.getByRole('link', { name: /link Integrations/i }).click();
            
            await page.waitForLoadState('networkidle', { timeout: 10000 });
            
            // Close the "Create a post" modal if it appears
            await page.keyboard.press('Escape');
            await page.waitForTimeout(500);
            
            await expect(page).toHaveURL(/\/settings\/integrations/, { timeout: 10000 });
        });

        await test.step('Ensure LinkedIn is disconnected first', async () => {
            console.log('🔍 Checking LinkedIn connection status...');
            
            // Look for disconnect button - if exists, account is connected
            const disconnectButton = page.getByRole('button', { name: 'Disconnect LinkedIn' });
            const isConnected = await disconnectButton.isVisible({ timeout: 2000 }).catch(() => false);
            
            if (isConnected) {
                console.log('⚠️ LinkedIn is connected, disconnecting first...');
                await disconnectButton.click();
                
                // Confirm disconnection
                await page.waitForLoadState('networkidle', { timeout: 5000 });
                await page.waitForTimeout(1000);
                await page.getByRole('button', { name: 'delete_forever Disconnect' }).click();
                
                // Wait for backend
                await page.waitForLoadState('networkidle', { timeout: 15000 });
                await page.waitForTimeout(2000);
                
                // Reload to verify disconnection
                await page.reload();
                await page.waitForLoadState('networkidle', { timeout: 10000 });
                
                // Close modal if appears
                await page.keyboard.press('Escape');
                await page.waitForTimeout(500);
            }
            
            console.log('✅ LinkedIn is disconnected, ready to connect');
        });

        await test.step('Click Connect LinkedIn button', async () => {
            console.log('🔗 Clicking Connect button...');
            
            // Find and click the Connect button
            const connectButton = page.getByRole('button', { name: /Connect arrow_forward/ }).first();
            
            // Wait for popup
            const popupPromise = page.waitForEvent('popup');
            await connectButton.click();
            
            const popup = await popupPromise;
            console.log('📱 LinkedIn popup opened, logging in...');
            
            await popup.waitForLoadState('domcontentloaded');
            
            // Get credentials from env
            const email = process.env.LINKEDIN_TEST_EMAIL || '';
            const password = process.env.LINKEDIN_TEST_PASSWORD || '';
            
            if (!email || !password) {
                throw new Error('LinkedIn credentials not found in .env (LINKEDIN_TEST_EMAIL, LINKEDIN_TEST_PASSWORD)');
            }
            
            console.log(`📝 Logging in with: ${email}`);
            
            // Enter email
            const emailField = popup.getByRole('textbox', { name: /Email or Phone/i });
            await emailField.fill(email);
            
            // Enter password
            const passwordField = popup.getByRole('textbox', { name: /Password/i });
            await passwordField.fill(password);
            
            // Click Sign in
            const signInButton = popup.getByRole('button', { name: /Sign in/i });
            await signInButton.click();
            
            console.log('⏳ Waiting for LinkedIn authentication...');
            
            // Wait for page to redirect (OAuth callback)
            try {
                await page.waitForURL(/settings\/integrations/, { timeout: 30000 });
            } catch (e) {
                console.error('❌ OAuth redirect timeout');
                throw e;
            }
            
            console.log('✅ Redirected back to integrations page');
            
            // Wait for any popup to close automatically
            try {
                await popup.waitForLoadState('domcontentloaded', { timeout: 3000 });
                if (!popup.isClosed()) {
                    await popup.close();
                }
            } catch (e) {
                // Popup may have already closed
            }
        });

        await test.step('Verify LinkedIn is now connected', async () => {
            console.log('🔍 Verifying LinkedIn connection...');
            
            // Wait for page to settle
            await page.waitForLoadState('networkidle', { timeout: 10000 });
            await page.waitForTimeout(2000);
            
            // Reload to get fresh state
            await page.reload();
            await page.waitForLoadState('networkidle', { timeout: 10000 });
            
            // Close modal if it appears
            await page.keyboard.press('Escape');
            await page.waitForTimeout(500);
            
            // Look for Connected badge or Disconnect button
            const disconnectButton = page.getByRole('button', { name: 'Disconnect LinkedIn' });
            const isConnected = await disconnectButton.isVisible({ timeout: 5000 });
            
            if (!isConnected) {
                console.error('❌ LinkedIn connection failed');
                throw new Error('LinkedIn not shown as connected after OAuth flow');
            }
            
            console.log('✅ LinkedIn successfully connected!');
            await expect(disconnectButton).toBeVisible();
        });

        await test.step('Disconnect LinkedIn', async () => {
            console.log('🔌 Disconnecting LinkedIn...');
            
            // Click Disconnect button
            const disconnectButton = page.getByRole('button', { name: 'Disconnect LinkedIn' });
            await disconnectButton.click();
            
            // Confirm disconnection
            await page.waitForLoadState('networkidle', { timeout: 5000 });
            await page.waitForTimeout(1000);
            
            const confirmButton = page.getByRole('button', { name: 'delete_forever Disconnect' });
            await confirmButton.click();
            
            // Wait for backend
            await page.waitForLoadState('networkidle', { timeout: 15000 });
            await page.waitForTimeout(2000);
            
            console.log('✅ LinkedIn disconnected successfully');
        });
    });
});
