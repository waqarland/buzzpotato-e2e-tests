import { Page, Locator } from '@playwright/test';

export class CreatePostPage {
    readonly page: Page;

    readonly topicModeTab: Locator;
    readonly ideaModeTab: Locator;
    readonly sourceModeTab: Locator;
    readonly topicInput: Locator;
    readonly generateButton: Locator;
    readonly generatedPostsContainer: Locator;

    constructor(page: Page) {
        this.page = page;

        this.topicModeTab = page.getByRole('tab', { name: /topic/i });
        this.ideaModeTab = page.getByRole('tab', { name: /idea/i });
        this.sourceModeTab = page.getByRole('tab', { name: /source/i });
        this.topicInput = page.getByPlaceholder(/enter topic/i);
        this.generateButton = page.getByRole('button', { name: /generate/i });
        this.generatedPostsContainer = page.getByTestId('generated-posts');
    }

    async goto() {
        await this.page.goto('/create/topic');
    }

    async generatePostFromTopic(topic: string) {
        await this.topicInput.fill(topic);
        await this.generateButton.click();

        // Wait for AI generation
        await this.generatedPostsContainer.waitFor({ state: 'visible', timeout: 30000 });
    }
}
