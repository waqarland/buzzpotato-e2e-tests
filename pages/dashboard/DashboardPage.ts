import { Page, Locator } from '@playwright/test';

export class DashboardPage {
    readonly page: Page;

    readonly createPostButton: Locator;
    readonly userMenu: Locator;
    readonly postsSection: Locator;

    constructor(page: Page) {
        this.page = page;

        this.createPostButton = page.getByRole('button', { name: /create post/i });
        this.userMenu = page.getByRole('button', { name: /user menu/i });
        this.postsSection = page.getByTestId('posts-section');
    }

    async goto() {
        await this.page.goto('/dashboard');
    }

    async clickCreatePost() {
        await this.createPostButton.click();
    }
}
