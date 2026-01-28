import { test, expect } from '../../fixtures/base';

test.describe('Post Generation Journey', () => {
    test.beforeEach(async ({ authenticatedPage, createPostPage }) => {
        await createPostPage.goto('source');
    });

    test('should generate a post from a single link for LinkedIn', async ({ page, createPostPage }) => {
        const testUrl = 'https://www.theverge.com/2024/1/25/24050516/google-gemini-pro-bard-update-image-generation';

        await test.step('Fill source URL and select LinkedIn', async () => {
            await createPostPage.selectPlatform('LinkedIn');
            await createPostPage.generatePostFromLink(testUrl);
        });

        await test.step('Verify generated post is visible', async () => {
            // Check for characteristics of a generated LinkedIn post
            const preview = page.locator('div.bg-surface-light, div.dark\\:bg-surface-dark').filter({ hasText: 'Post Preview' });
            await expect(preview).toBeVisible({ timeout: 60000 });

            const postContent = preview.locator('p.text-text-main').first();
            await expect(postContent).not.toBeEmpty();
        });
    });

    test('should generate a post from a single link for Twitter/X', async ({ page, createPostPage }) => {
        const testUrl = 'https://techcrunch.com/2024/01/25/apple-announces-major-app-store-changes-in-the-eu/';

        await test.step('Select Twitter platform and generate', async () => {
            await createPostPage.selectPlatform('Twitter');
            await createPostPage.generatePostFromLink(testUrl);
        });

        await test.step('Verify X post preview', async () => {
            const preview = page.locator('div.bg-surface-light, div.dark\\:bg-surface-dark').filter({ hasText: 'Post Preview' });
            await expect(preview).toBeVisible({ timeout: 60000 });

            // Verify hashtags if enabled (advanced options)
            // By default hashtags are enabled
            const content = await preview.textContent();
            expect(content).toContain('#');
        });
    });
});
