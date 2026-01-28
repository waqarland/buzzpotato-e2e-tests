import { Page, Locator } from '@playwright/test';

/**
 * Page Object for the Integrations Settings page
 * Handles LinkedIn, Twitter, and other social platform OAuth connections
 * 
 * Supports both mocked and real OAuth flows via environment configuration
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

    // Facebook Integration
    readonly facebookCard: Locator;
    readonly connectFacebookButton: Locator;

    constructor(page: Page) {
        this.page = page;

        // ========== LinkedIn Section ==========
        // LinkedIn card container
        this.linkedinCard = page.locator('div').filter({ hasText: /^LinkedIn/ }).first();

        // Connect button (visible when not connected)
        // Scoped to LinkedIn card to avoid matching other integration buttons
        this.connectLinkedInButton = this.linkedinCard
            .locator('button:has-text("Connect")')
            .first();

        // Disconnect button (visible when connected)
        this.disconnectLinkedInButton = this.linkedinCard.locator('button[aria-label="Disconnect LinkedIn"]');

        // Status indicators
        this.linkedInStatusBadge = this.linkedinCard.locator('span').filter({ hasText: /^Connected$/ });
        this.linkedInConnectingStatus = this.linkedinCard.locator('span').filter({ hasText: /Pending connection/ });

        // ========== Twitter Section ==========
        this.twitterCard = page.locator('div').filter({ hasText: /^Twitter|^X / }).first();
        this.connectTwitterButton = this.twitterCard
            .locator('button:has-text("Connect")')
            .first();

        // ========== Facebook Section ==========
        this.facebookCard = page.locator('div').filter({ hasText: /^Facebook/ }).first();
        this.connectFacebookButton = this.facebookCard
            .locator('button:has-text("Connect")')
            .first();
    }

    /**
     * Navigate to integrations page
     */
    async goto() {
        await this.page.goto('/settings/integrations');
        await this.page.waitForLoadState('networkidle');
    }

    /**
     * Check if LinkedIn is currently connected
     */
    async isLinkedInConnected(): Promise<boolean> {
        return await this.linkedInStatusBadge.isVisible().catch(() => false);
    }

    /**
     * Check if LinkedIn connection is pending
     */
    async isLinkedInPending(): Promise<boolean> {
        return await this.linkedInConnectingStatus.isVisible().catch(() => false);
    }

    /**
     * Click the LinkedIn Connect button and wait for OAuth flow to complete
     * 
     * With mocks: Returns immediately after OAuth callback
     * With real: Opens LinkedIn login popup (manual interaction needed in real mode)
     */
    async connectLinkedIn() {
        // Verify the button exists and is visible
        await this.connectLinkedInButton.waitFor({ state: 'visible', timeout: 10000 });

        // Click the button to initiate OAuth
        await this.connectLinkedInButton.click({ timeout: 10000 });

        // Wait for the OAuth flow to complete
        // With mocks, this happens quickly
        // With real OAuth, this waits for the callback
        await this.page.waitForLoadState('networkidle');

        // Give async operations time to settle
        await this.page.waitForTimeout(1000);
    }

    /**
     * Wait for LinkedIn connection to complete (success or pending state)
     * Useful when connection completes after button click
     */
    async waitForConnectionComplete(timeoutMs: number = 15000) {
        await Promise.race([
            this.linkedInStatusBadge.waitFor({ state: 'visible', timeout: timeoutMs }),
            this.linkedInConnectingStatus.waitFor({ state: 'visible', timeout: timeoutMs }),
        ]).catch(() => {
            // Connection might not update UI immediately, that's OK
            console.warn('Connection status not visible, but OAuth flow may have completed');
        });
    }

    /**
     * Disconnect LinkedIn account
     */
    async disconnectLinkedIn() {
        // Verify the disconnect button exists and is visible
        await this.disconnectLinkedInButton.waitFor({ state: 'visible', timeout: 10000 });

        // Click to disconnect
        await this.disconnectLinkedInButton.click();

        // Wait for the disconnect confirmation modal
        const confirmButton = this.page.getByRole('button', { name: /confirm|disconnect/i });
        await confirmButton.waitFor({ state: 'visible', timeout: 5000 });

        // Confirm the disconnection
        await confirmButton.click();

        // Wait for the UI to update
        await this.page.waitForLoadState('networkidle');
    }

    /**
     * Check if LinkedIn integration card is visible on the page
     */
    async isLinkedInCardVisible(): Promise<boolean> {
        return await this.linkedinCard.isVisible().catch(() => false);
    }

    /**
     * Connect Twitter account (if supported)
     */
    async connectTwitter() {
        await this.connectTwitterButton.waitFor({ state: 'visible', timeout: 10000 });
        await this.connectTwitterButton.click();
        await this.page.waitForLoadState('networkidle');
    }

    /**
     * Connect Facebook account (if supported)
     */
    async connectFacebook() {
        await this.connectFacebookButton.waitFor({ state: 'visible', timeout: 10000 });
        await this.connectFacebookButton.click();
        await this.page.waitForLoadState('networkidle');
    }
}
