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

        // Modern approach: use getByRole, getByLabel, getByTestId
        this.emailInput = page.getByLabel('Email', { exact: true });
        this.passwordInput = page.getByLabel('Password', { exact: true });
        this.loginButton = page.getByRole('button', { name: 'Login' });
        this.errorMessage = page.getByRole('alert');
        this.signupLink = page.getByRole('link', { name: 'Sign up' });
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

        // Wait for navigation
        await this.page.waitForURL(/\/dashboard|\/onboarding/);
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
