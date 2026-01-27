/**
 * Smoke Tests - Critical Path
 * Runs first in CI/CD pipeline for fast feedback
 */

import { test, expect } from '../../fixtures/base';

test.describe('Smoke Tests - Critical Paths', () => {
    test('E2E: User can create a post from topic', async ({ authenticatedPage, createPostPage }) => {
        // Given: user is on create post page
        await createPostPage.goto();

        // When: user generates a post from topic
        await createPostPage.generatePostFromTopic('Best practices for software testing');

        // Then: posts are generated
        await expect(createPostPage.generatedPostsContainer).toBeVisible();

        // Visual regression check (modern Playwright feature)
        await expect(createPostPage.generatedPostsContainer).toHaveScreenshot('generated-posts.png');
    });
});
