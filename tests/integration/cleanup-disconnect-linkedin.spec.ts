import { test, expect } from '../../fixtures/base';

/**
 * Utility test to disconnect LinkedIn account if it's connected
 * Run this before test suite to ensure clean state
 * 
 * Usage: npx playwright test tests/integration/cleanup-disconnect-linkedin.spec.ts --headed
 * 
 * Recorded with Playwright codegen - handles both connected and disconnected states
 */
test('Disconnect LinkedIn account if connected', async ({ page, authenticatedPage }) => {
    await test.step('Navigate to Integrations', async () => {
        console.log('📱 Navigating to Integrations...');
        
        // Click user avatar link
        await page.getByRole('link', { name: /avatar/i }).click();
        
        // Click Integrations link
        console.log('📋 Clicking Integrations link...');
        await page.getByRole('link', { name: /link Integrations/i }).click();
        
        await page.waitForLoadState('networkidle', { timeout: 10000 });
        
        // Close the "Create a post" modal if it appears
        console.log('📋 Closing "Create a post" modal if present...');
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
    });

    await test.step('Check LinkedIn connection status', async () => {
        console.log('🔍 Checking LinkedIn connection status...');
        
        // Look for the disconnect button - if it exists, account is connected
        const disconnectButton = page.getByRole('button', { name: 'Disconnect LinkedIn' });
        const isConnected = await disconnectButton.isVisible({ timeout: 2000 }).catch(() => false);
        
        if (!isConnected) {
            console.log('✅ LinkedIn is already disconnected - no action needed');
            return; // Skip disconnect steps if not connected
        }
        
        console.log('⚠️ LinkedIn is connected - proceeding with disconnect...');
        
        // Click the Disconnect LinkedIn button
        console.log('🔌 Clicking "Disconnect LinkedIn" button...');
        await disconnectButton.click();
        
        // Wait for confirmation modal to appear
        console.log('⏳ Waiting for confirmation modal...');
        await page.waitForLoadState('networkidle', { timeout: 5000 });
        await page.waitForTimeout(1000);
        
        // Click the confirmation disconnect button
        console.log('✓ Clicking disconnect confirmation button...');
        await page.getByRole('button', { name: 'delete_forever Disconnect' }).click();
        
        // Wait for backend to process
        console.log('⏳ Waiting for disconnection to complete...');
        await page.waitForLoadState('networkidle', { timeout: 15000 });
        await page.waitForTimeout(2000);
        
        // Reload page to verify disconnection
        console.log('🔄 Reloading page to verify disconnection...');
        await page.reload();
        await page.waitForLoadState('networkidle', { timeout: 15000 });
        
        // Close modal if it appears
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        
        // Final verification
        const stillConnected = await disconnectButton.isVisible({ timeout: 2000 }).catch(() => false);
        
        if (stillConnected) {
            throw new Error('LinkedIn still connected after disconnect action');
        }
        
        console.log('✅ LinkedIn successfully disconnected!');
    });
});
