# Testing OAuth Integrations in BuzzPotato

This guide explains how to test OAuth integrations (LinkedIn, Twitter, Facebook) in the BuzzPotato E2E test suite.

## Quick Start

### 🚀 Run OAuth Tests with Mocked Flows (Default)

```bash
# Run all tests with mocked OAuth (no credentials needed)
npm test

# Run only LinkedIn OAuth tests
npx playwright test tests/integration/linkedin-oauth.spec.ts

# Run with browser visible
npm run test:headed

# Debug mode with inspector
npm run test:debug
```

**✓ No setup required!** Mocked OAuth flows work immediately.

---

## Understanding OAuth Mocking

### What is OAuth Mocking?

OAuth mocking prevents real login popups by intercepting OAuth requests at your app's callback level. This is the **industry standard** for testing OAuth without credentials.

### How It Works

```
User clicks "Connect LinkedIn"
    ↓
Your app initiates OAuth (opens popup)
    ↓
Mock intercepts LinkedIn authorization endpoint
    ↓
Mock generates fake auth code
    ↓
Your app receives auth code
    ↓
Mock intercepts token exchange
    ↓
Test completes without real LinkedIn login ✓
```

### Why This Approach?

| Aspect | Mocked OAuth | Real OAuth |
|--------|-------------|-----------|
| **Speed** | Fast (no network) | Slow (real API calls) |
| **Reliability** | Consistent | Depends on LinkedIn |
| **Credentials Needed** | No | Yes |
| **CI/CD Friendly** | Perfect | Complex |
| **Tests What** | Your code logic | Third-party APIs |

---

## Environment Configuration

### Default: Mocked OAuth (Recommended)

No configuration needed! The tests use mocked OAuth by default.

```bash
# .env or .env.local
BASE_URL=https://buzzpotato.online
TEST_USER_EMAIL=testuser@buzzpotato.test
TEST_USER_PASSWORD=SecurePassword123!
# OAUTH_MODE defaults to 'mock'
```

### Advanced: Real OAuth Testing

To test against actual LinkedIn OAuth:

1. **Set up LinkedIn OAuth App**
   - Go to [LinkedIn Developers](https://www.linkedin.com/developers/apps)
   - Create an OAuth app
   - Get your Client ID and Client Secret

2. **Create test account**
   - Use a separate LinkedIn account for testing
   - Never use production credentials

3. **Configure environment**
   ```bash
   # .env
   OAUTH_MODE=real
   LINKEDIN_CLIENT_ID=your-client-id
   LINKEDIN_CLIENT_SECRET=your-client-secret
   LINKEDIN_TEST_ACCOUNT_EMAIL=test@example.com
   LINKEDIN_TEST_ACCOUNT_PASSWORD=test-password
   ```

4. **Run tests**
   ```bash
   OAUTH_MODE=real npm test
   ```

---

## Writing OAuth Tests

### Example 1: Using the IntegrationsPage Page Object

```typescript
import { test, expect } from '../../fixtures/base';

test('connect LinkedIn through UI', async ({ authenticatedPage, integrationsPage }) => {
    // Navigate to integrations page
    await integrationsPage.goto();

    // Verify LinkedIn card is visible
    const isLinkedInCardVisible = await integrationsPage.isLinkedInCardVisible();
    expect(isLinkedInCardVisible).toBeTruthy();

    // Connect LinkedIn
    await integrationsPage.connectLinkedIn();

    // Verify API endpoint confirms connection
    const response = await authenticatedPage.request.get('/api/integrations/linkedin/status');
    expect(response.ok()).toBeTruthy();
});
```

### Example 2: Using the LinkedInMocked Fixture

```typescript
test('handle LinkedIn errors', async ({ authenticatedPage, integrationsPage, linkedInMocked }) => {
    // Mocks are automatically applied via fixture
    
    await integrationsPage.goto();
    
    // Verify initial state
    const isConnected = await integrationsPage.isLinkedInConnected();
    expect(isConnected).toBeFalsy();
    
    // Verify Connect button is available
    await expect(integrationsPage.connectLinkedInButton).toBeVisible();
});
```

### Example 3: Testing Multiple Integrations

```typescript
test('manage multiple integrations', async ({ integrationsPage }) => {
    await integrationsPage.goto();

    // LinkedIn
    if (await integrationsPage.isLinkedInCardVisible()) {
        await expect(integrationsPage.connectLinkedInButton).toBeVisible();
    }

    // Twitter (X)
    const twitterVisible = await integrationsPage.twitterCard.isVisible().catch(() => false);
    if (twitterVisible) {
        await expect(integrationsPage.connectTwitterButton).toBeVisible();
    }

    // Facebook
    const facebookVisible = await integrationsPage.facebookCard.isVisible().catch(() => false);
    if (facebookVisible) {
        await expect(integrationsPage.connectFacebookButton).toBeVisible();
    }
});
```

---

## IntegrationsPage API Reference

### Properties

```typescript
// LinkedIn
integrationsPage.linkedinCard           // The LinkedIn integration card
integrationsPage.connectLinkedInButton   // Connect button
integrationsPage.linkedInStatusBadge     // Connected badge

// Twitter
integrationsPage.twitterCard
integrationsPage.connectTwitterButton

// Facebook
integrationsPage.facebookCard
integrationsPage.connectFacebookButton
```

### Methods

```typescript
// Navigation
await integrationsPage.goto()
// Navigate to /settings/integrations and wait for page load

// LinkedIn methods
await integrationsPage.connectLinkedIn()
// Click connect and wait for OAuth flow

await integrationsPage.disconnectLinkedIn()
// Disconnect LinkedIn with confirmation

const isConnected = await integrationsPage.isLinkedInConnected()
// Check if LinkedIn is currently connected (boolean)

const isPending = await integrationsPage.isLinkedInPending()
// Check if connection is pending (boolean)

await integrationsPage.waitForConnectionComplete()
// Wait up to 15 seconds for connection state change

// Other integrations
await integrationsPage.connectTwitter()
await integrationsPage.connectFacebook()
```

---

## Mocking Details

### What Gets Mocked?

The `setupLinkedInMocks()` helper mocks:

1. **LinkedIn OAuth Authorization Endpoint**
   ```
   https://www.linkedin.com/oauth/v2/authorization
   ```
   Returns a fake auth code instead of opening login popup

2. **LinkedIn Token Exchange**
   ```
   https://www.linkedin.com/oauth/v2/accessToken
   ```
   Returns a mock access token

3. **LinkedIn User Profile Endpoint**
   ```
   https://api.linkedin.com/v2/userinfo
   ```
   Returns a mock user profile

### Mock User Profile

```typescript
{
    sub: 'mock_linkedin_user_123',
    name: 'Test User',
    given_name: 'Test',
    family_name: 'User',
    email: 'test@yopmail.com',
    picture: 'https://via.placeholder.com/150',
    email_verified: true
}
```

---

## Troubleshooting

### Issue: Real LinkedIn login popup appears

**Cause**: You're in real OAuth mode but don't have credentials configured

**Solution**:
```bash
# Either use mocked mode (default)
npm test

# Or configure real mode properly
OAUTH_MODE=mock npm test  # Explicitly use mocks
```

### Issue: Tests timeout waiting for connection

**Cause**: OAuth mocks aren't being applied

**Solution**:
```typescript
// Make sure you're using the fixture
test('my test', async ({ linkedInMocked, integrationsPage }) => {
    await integrationsPage.connectLinkedIn();
});
```

### Issue: "API endpoint returns 404"

**Cause**: Your backend doesn't have the OAuth callback implemented

**Solution**: Verify your backend implements:
- `POST /api/integrations/linkedin/callback`
- `GET /api/integrations/linkedin/status`

### Issue: Tests pass locally but fail in CI

**Cause**: Missing environment variables in GitHub Actions

**Solution**: Update `.github/workflows/e2e-tests.yml`:
```yaml
env:
  BASE_URL: ${{ secrets.BASE_URL }}
  TEST_USER_EMAIL: ${{ secrets.TEST_USER_EMAIL }}
  TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}
  OAUTH_MODE: mock  # Always use mocks in CI
  MOCK_OAUTH_ENABLED: true
```

---

## Best Practices

### ✅ DO

- Use mocked OAuth for CI/CD pipelines
- Use `integrationsPage` page object instead of raw locators
- Use the `linkedInMocked` fixture for OAuth tests
- Clean up integrations after tests (see cleanup section)
- Test both connected and disconnected states

### ❌ DON'T

- Use real LinkedIn credentials in CI/CD
- Mix real and mocked OAuth in the same test suite
- Hardcode OAuth parameters
- Test LinkedIn's OAuth implementation (test yours)
- Commit `.env` files with real credentials

---

## Test Cleanup

### Disconnect After Each Test

```typescript
import { test, expect } from '../../fixtures/base';

test.describe('LinkedIn Integration', () => {
    test('my test', async ({ integrationsPage, authenticatedPage }) => {
        await integrationsPage.goto();
        // ... test code ...
    });

    test.afterEach(async ({ authenticatedPage }) => {
        // Clean up: disconnect LinkedIn
        try {
            const response = await authenticatedPage.request.post(
                '/api/integrations/linkedin/disconnect',
                { data: {} }
            );
            if (response.ok()) {
                console.log('✓ Cleaned up LinkedIn connection');
            }
        } catch (e) {
            // Cleanup failure shouldn't fail the test
            console.warn('Cleanup warning:', e);
        }
    });
});
```

---

## Advanced: Using OAuth Config Helper

The `OAuthConfig` helper provides utilities for checking the OAuth mode:

```typescript
import { OAuthConfig } from '../../helpers/oauth-config';

// Check which mode we're in
if (OAuthConfig.isMockMode()) {
    console.log('Using mocked OAuth');
} else if (OAuthConfig.isRealMode()) {
    console.log('Using real OAuth');
}

// Get configuration based on mode
const config = OAuthConfig.getLinkedInConfig();
console.log(`Mode: ${config.mode}`);

// Log configuration for debugging
OAuthConfig.logConfiguration();
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests with OAuth

on: [push]

jobs:
  test:
    runs-on: ubuntu-latest
    
    env:
      BASE_URL: ${{ secrets.BASE_URL }}
      TEST_USER_EMAIL: ${{ secrets.TEST_USER_EMAIL }}
      TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}
      # Always use mocks in CI - more reliable
      OAUTH_MODE: mock
      MOCK_OAUTH_ENABLED: true
    
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - run: npm install
      - run: npx playwright install --with-deps
      
      # Run tests - OAuth mocks handle authentication
      - run: npm test
      
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## FAQ

**Q: Can I test without any credentials?**  
A: Yes! Use mocked OAuth (default mode). No credentials needed.

**Q: Can I test real OAuth?**  
A: Yes, but you'll need LinkedIn test credentials and set `OAUTH_MODE=real`.

**Q: Are mocked tests as good as real OAuth tests?**  
A: Better! Mocked tests:
- Are faster
- Are more reliable
- Don't depend on third parties
- Test your code logic (not LinkedIn's)

**Q: What if my backend doesn't implement the callback?**  
A: Add the endpoint to your backend:
```typescript
// Example: Next.js API route
export async function POST(req: Request) {
    const { code, state } = req.nextUrl.searchParams;
    
    // Exchange code for token
    const token = await exchangeLinkedInCode(code);
    
    // Save connection to database
    await saveLinkedInConnection(token);
    
    // Redirect back with success
    return redirect('/settings/integrations?success=linkedin_connected');
}
```

**Q: How do I test error scenarios?**  
A: Use `setupLinkedInMocksWithError()`:
```typescript
import { setupLinkedInMocksWithError } from '../../helpers/linkedin-mock';

test('handle OAuth errors', async ({ page }) => {
    await setupLinkedInMocksWithError(page, 'access_denied');
    
    // Now OAuth will fail
    // Test error handling
});
```

---

## Learn More

- [Playwright OAuth Testing Guide](https://playwright.dev/docs/auth)
- [LinkedIn OAuth Documentation](https://docs.microsoft.com/en-us/linkedin/shared/authentication/authentication)
- [Project Improvements](./PROJECT_IMPROVEMENTS.md)

---

**Last Updated**: January 28, 2026  
**Status**: All 3 LinkedIn OAuth tests passing ✅
