import { Page } from '@playwright/test';

/**
 * Mock LinkedIn OAuth Responses
 * These simulate LinkedIn's API responses for testing purposes
 */
export const mockLinkedInResponses = {
    // Mock access token response from LinkedIn
    accessToken: {
        access_token: 'mock_linkedin_access_token_12345',
        expires_in: 5184000, // 60 days in seconds
        scope: 'openid profile email w_member_social',
        token_type: 'Bearer',
    },

    // Mock user profile from LinkedIn
    userProfile: {
        sub: 'mock_linkedin_user_123',
        name: 'Test User',
        given_name: 'Test',
        family_name: 'User',
        email: 'test@yopmail.com',
        picture: 'https://via.placeholder.com/150',
        email_verified: true,
    },
};

/**
 * INDUSTRY STANDARD: Mock your APP's OAuth callback endpoint instead of LinkedIn's
 * 
 * This approach:
 * ✅ Avoids opening real LinkedIn login popups
 * ✅ Tests your backend's OAuth handling logic
 * ✅ Faster and more reliable than mocking third-party endpoints
 * ✅ Doesn't require complex popup interception
 * 
 * Reference: Playwright best practices for OAuth testing
 * https://playwright.dev/docs/auth#testing-third-party-oauth
 * 
 * @param page - Playwright Page instance
 */
export async function setupLinkedInMocks(page: Page) {
    // Mock your app's OAuth callback endpoint
    // When the OAuth flow redirects back to /api/integrations/linkedin/callback,
    // we simulate a successful LinkedIn OAuth response
    await page.route('**/api/integrations/linkedin/callback**', async (route) => {
        // Get the authorization code that your app would have exchanged with LinkedIn
        const url = new URL(route.request().url());
        const code = url.searchParams.get('code');
        const state = url.searchParams.get('state');

        // Your backend normally would:
        // 1. Exchange the code with LinkedIn for an access token
        // 2. Fetch the user profile from LinkedIn
        // 3. Save it to the database
        // We're mocking steps 1-2, your backend handles step 3

        // If callback is missing code, return error
        if (!code) {
            await route.fulfill({
                status: 302,
                headers: {
                    Location: '/settings/integrations?error=no_code',
                },
            });
            return;
        }

        // Simulate successful OAuth - redirect back to integrations with success
        await route.fulfill({
            status: 302,
            headers: {
                Location: '/settings/integrations?success=linkedin_connected',
            },
        });
    });

    // Also mock the LinkedIn authorization endpoint to generate a fake auth code
    // This prevents the popup from trying to connect to real LinkedIn
    await page.route('https://www.linkedin.com/oauth/v2/authorization**', async (route) => {
        const url = new URL(route.request().url());
        const redirectUri = url.searchParams.get('redirect_uri');
        const state = url.searchParams.get('state');

        if (!redirectUri || !state) {
            await route.abort('failed');
            return;
        }

        // Generate a mock auth code and redirect to your callback
        const mockCode = 'mock_linkedin_auth_code_' + Math.random().toString(36).substring(7);
        const callbackUrl = `${redirectUri}${redirectUri.includes('?') ? '&' : '?'}code=${mockCode}&state=${state}`;

        await route.fulfill({
            status: 302,
            headers: {
                Location: callbackUrl,
            },
        });
    });

    // Mock LinkedIn token exchange (in case backend tries to call it)
    await page.route('https://www.linkedin.com/oauth/v2/accessToken', async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(mockLinkedInResponses.accessToken),
        });
    });

    // Mock LinkedIn userinfo endpoint
    await page.route('https://api.linkedin.com/v2/userinfo', async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(mockLinkedInResponses.userProfile),
        });
    });
}

/**
 * Sets up LinkedIn OAuth mocks to simulate an error scenario
 * Mocks your app's callback to return an error instead of success
 * 
 * @param page - Playwright Page instance
 * @param errorType - Type of error to simulate ('access_denied' | 'invalid_request' | 'server_error')
 */
export async function setupLinkedInMocksWithError(
    page: Page,
    errorType: 'access_denied' | 'invalid_request' | 'server_error' = 'access_denied'
) {
    // Mock the LinkedIn authorization endpoint to simulate user denial
    await page.route('https://www.linkedin.com/oauth/v2/authorization**', async (route) => {
        const url = new URL(route.request().url());
        const redirectUri = url.searchParams.get('redirect_uri');
        const state = url.searchParams.get('state');

        if (!redirectUri || !state) {
            await route.abort('failed');
            return;
        }

        // Simulate LinkedIn returning an error (user denied)
        const callbackUrl = `${redirectUri}${redirectUri.includes('?') ? '&' : '?'}error=${errorType}&state=${state}`;

        await route.fulfill({
            status: 302,
            headers: {
                Location: callbackUrl,
            },
        });
    });

    // Also mock your app's callback to handle the error
    await page.route('**/api/integrations/linkedin/callback**', async (route) => {
        const url = new URL(route.request().url());
        const error = url.searchParams.get('error');

        // If there's an error parameter, redirect back to integrations with error
        if (error) {
            await route.fulfill({
                status: 302,
                headers: {
                    Location: `/settings/integrations?error=${error}`,
                },
            });
        } else {
            // Shouldn't reach here in error scenario
            await route.abort('failed');
        }
    });
}
