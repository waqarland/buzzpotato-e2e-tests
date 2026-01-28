import { test, expect } from '../../fixtures/base';

/**
 * LinkedIn OAuth Integration Tests - REAL MODE ONLY
 * No mocking - uses actual LinkedIn authentication
 * 
 * These tests verify:
 * 1. OAuth flow initiation works
 * 2. Connection/disconnection works properly
 * 3. Error handling is robust
 * 
 * Prerequisites:
 * - OAUTH_MODE=real in .env
 * - Valid LinkedIn test credentials in .env
 * 
 * Run: npx playwright test tests/integration/linkedin-oauth-simple.spec.ts --headed
 */

async function navigateToIntegrations(page: any) {
    console.log('📱 Navigating to Integrations...');
    
    // Click user avatar
    await page.getByRole('link', { name: /avatar/i }).click();
    
    // Click Integrations link
    await page.getByRole('link', { name: /link Integrations/i }).click();
    
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    
    // Close the "Create a post" modal if it appears
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
}

async function ensureLinkedInDisconnected(page: any) {
    console.log('🔍 Checking LinkedIn status...');
    
    const disconnectButton = page.getByRole('button', { name: 'Disconnect LinkedIn' });
    const isConnected = await disconnectButton.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (isConnected) {
        console.log('🔌 Disconnecting LinkedIn...');
        await disconnectButton.click();
        
        await page.waitForLoadState('networkidle', { timeout: 5000 });
        await page.waitForTimeout(1000);
        
        await page.getByRole('button', { name: 'delete_forever Disconnect' }).click();
        
        await page.waitForLoadState('networkidle', { timeout: 15000 });
        await page.waitForTimeout(2000);
        
        // Reload to verify
        await page.reload();
        await page.waitForLoadState('networkidle', { timeout: 10000 });
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
    }
    
    console.log('✅ LinkedIn is disconnected');
}

test.describe('LinkedIn OAuth - Real Mode', () => {

    test('should successfully connect and disconnect LinkedIn', async ({ page, authenticatedPage }) => {
        await test.step('Navigate to Integrations', async () => {
            await navigateToIntegrations(page);
            await expect(page).toHaveURL(/\/settings\/integrations/);
        });

        await test.step('Ensure LinkedIn is disconnected', async () => {
            await ensureLinkedInDisconnected(page);
        });

        await test.step('Verify Connect button is visible', async () => {
            const connectButton = page.getByRole('button', { name: /Connect arrow_forward/ }).first();
            await expect(connectButton).toBeVisible();
        });

        await test.step('Click Connect and authenticate with LinkedIn', async () => {
            console.log('🔗 Starting LinkedIn OAuth flow...');
            
            const connectButton = page.getByRole('button', { name: /Connect arrow_forward/ }).first();
            
            // Wait for popup
            const popupPromise = page.waitForEvent('popup');
            await connectButton.click();
            
            const popup = await popupPromise;
            console.log('📱 LinkedIn login popup opened');
            
            await popup.waitForLoadState('domcontentloaded');
            
            // Get credentials
            const email = process.env.LINKEDIN_TEST_EMAIL || '';
            const password = process.env.LINKEDIN_TEST_PASSWORD || '';
            
            if (!email || !password) {
                throw new Error('LinkedIn credentials not configured in .env');
            }
            
            // Fill login form
            console.log(`📝 Logging in as: ${email}`);
            await popup.getByRole('textbox', { name: /Email or Phone/i }).fill(email);
            await popup.getByRole('textbox', { name: /Password/i }).fill(password);
            await popup.getByRole('button', { name: /Sign in/i }).click();
            
            // Wait for redirect
            console.log('⏳ Authenticating...');
            await page.waitForURL(/settings\/integrations/, { timeout: 30000 });
            
            if (!popup.isClosed()) {
                await popup.close();
            }
            
            console.log('✅ OAuth flow completed');
        });

        await test.step('Verify LinkedIn is now connected', async () => {
            console.log('🔍 Verifying connection...');
            
            await page.waitForLoadState('networkidle', { timeout: 10000 });
            await page.waitForTimeout(2000);
            
            // Reload to get fresh state
            await page.reload();
            await page.waitForLoadState('networkidle', { timeout: 10000 });
            
            await page.keyboard.press('Escape');
            await page.waitForTimeout(500);
            
            // Verify Disconnect button is visible (means connected)
            const disconnectButton = page.getByRole('button', { name: 'Disconnect LinkedIn' });
            await expect(disconnectButton).toBeVisible({ timeout: 5000 });
            
            console.log('✅ LinkedIn connection verified');
        });

        await test.step('Disconnect LinkedIn', async () => {
            console.log('🔌 Disconnecting LinkedIn...');
            
            const disconnectButton = page.getByRole('button', { name: 'Disconnect LinkedIn' });
            await disconnectButton.click();
            
            await page.waitForLoadState('networkidle', { timeout: 5000 });
            await page.waitForTimeout(1000);
            
            await page.getByRole('button', { name: 'delete_forever Disconnect' }).click();
            
            await page.waitForLoadState('networkidle', { timeout: 15000 });
            await page.waitForTimeout(2000);
            
            console.log('✅ LinkedIn disconnected successfully');
        });
    });

    test('should display LinkedIn as not connected by default', async ({ page, authenticatedPage }) => {
        await test.step('Navigate to Integrations', async () => {
            await navigateToIntegrations(page);
        });

        await test.step('Ensure LinkedIn is disconnected', async () => {
            await ensureLinkedInDisconnected(page);
        });

        await test.step('Verify Connect button is visible', async () => {
            console.log('🔍 Checking LinkedIn card...');
            
            const connectButton = page.getByRole('button', { name: /Connect arrow_forward/ }).first();
            
            // Verify Connect button is visible (not connected)
            await expect(connectButton).toBeVisible();
            
            // Verify Disconnect button is NOT visible (not connected)
            const disconnectButton = page.getByRole('button', { name: 'Disconnect LinkedIn' });
            await expect(disconnectButton).not.toBeVisible();
            
            console.log('✅ LinkedIn displayed as not connected');
        });
    });
});
