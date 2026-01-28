import { Page, Locator } from '@playwright/test';

export class CreatePostPage {
    readonly page: Page;

    readonly topicModeTab: Locator;
    readonly sourceModeTab: Locator;
    readonly topicInput: Locator;
    readonly sourceUrlInput: Locator;
    readonly generateButton: Locator;
    readonly generatedPostsContainer: Locator;

    constructor(page: Page) {
        this.page = page;

        this.topicModeTab = page.getByRole('button', { name: /topic mode/i });
        this.sourceModeTab = page.getByRole('button', { name: /source mode/i });
        this.topicInput = page.getByPlaceholder(/discussing the importance/i);
        this.sourceUrlInput = page.getByPlaceholder(/paste links here/i);
        this.generateButton = page.getByRole('button', { name: /generate post/i });
        this.generatedPostsContainer = page.locator('#results'); // Results area in topic mode or preview in source mode
    }

    async goto(mode: 'topic' | 'source' = 'topic') {
        const path = mode === 'topic' ? '/create/topic' : '/create/source';
        await this.page.goto(path);
    }

    async generatePostFromTopic(topic: string) {
        await this.topicModeTab.click();
        await this.topicInput.fill(topic);
        await this.generateButton.click();

        // Wait for AI generation
        await this.generatedPostsContainer.scrollIntoViewIfNeeded();
        await this.generatedPostsContainer.waitFor({ state: 'visible', timeout: 60000 });
    }

    async generatePostFromLink(url: string) {
        await this.sourceModeTab.click();
        await this.sourceUrlInput.fill(url);
        await this.generateButton.click();

        // Wait for AI generation (preview appears)
        // In source mode, the preview is on the right side
        const preview = this.page.locator('text=AI Preview locked').hidden;
        await this.page.waitForSelector('text=Auto-generated Hashtags', { state: 'visible', timeout: 60000 });
    }

    async selectPlatform(platform: 'LinkedIn' | 'Twitter' | 'Facebook' | 'Instagram') {
        const platformName = platform === 'Twitter' ? 'X' : platform;
        await this.page.locator('label').filter({ hasText: platformName }).click();
    }
}
