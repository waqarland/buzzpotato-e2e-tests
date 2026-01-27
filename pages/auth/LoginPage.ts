import { Page, Locator } from '@playwright/test';

/**
 * Lightweight Page Object - Modern Best Practice
 * 
 * Rules:
 * 1. Only locators and simple actions
 * 2. No complex logic or assertions
 * 3. Use auto-waiting Playwright locators
 * 4. Prefer data-testid over CSS/XPath
 */
export class LoginPage {
    readonly page: Page;

    // Locators (declarative, lazy-evaluated)
    readonly emailInput: Locator;
    readonly passwordInput: Locator;
    readonly loginButton: Locator;
    readonly errorMessage: Locator;
    readonly signupLink: Locator;

    constructor(page: Page) {
        this.page = page;

        // Use ID-based selectors matching actual BuzzPotato implementation
        this.emailInput = page.locator('#email');
        this.passwordInput = page.locator('#password');
        this.loginButton = page.locator('button[type="submit"]').filter({ hasText: 'Sign In' });
        this.errorMessage = page.locator('.bg-red-500\/10');
        this.signupLink = page.locator('a[href="/signup"]');
    }

    /**
     * Navigate to login page
     */
    async goto() {
        await this.page.goto('/login');
    }

    /**
     * Perform login action
     */
    async loginViaUI(email: string, password: string) {
        await this.emailInput.fill(email);
        await this.passwordInput.fill(password);
        await this.loginButton.click();

        // Wait for navigation - could be dashboard or onboarding
        await this.page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 60000 });
    }

    /**
     * Fast login via API (App Actions pattern)
     * Bypasses UI for speed - use in fixtures
     */
    async loginViaAPI(email: string, password: string) {
        const response = await this.page.request.post('/api/auth/login', {
            data: { email, password },
        });

        // Cookies are automatically saved to browser context
        return response.ok();
    }

    /**
     * Check if error is displayed
     */
    async getErrorText(): Promise<string> {
        return await this.errorMessage.textContent() ?? '';
    }
}
