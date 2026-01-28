# API Reference

Complete reference for helper functions, utilities, and page objects.

## 📚 Helper Functions

### OAuth Configuration (`helpers/oauth-config.ts`)

#### `isMockMode()`
Check if running in mock OAuth mode.

```typescript
if (isMockMode()) {
  console.log('Using mocked LinkedIn');
}
```

**Returns:** `boolean`

---

#### `isRealMode()`
Check if running in real OAuth mode.

```typescript
if (isRealMode()) {
  console.log('Using real LinkedIn');
}
```

**Returns:** `boolean`

---

#### `getMode()`
Get current OAuth mode.

```typescript
const mode = getMode();
console.log(mode); // 'mock' or 'real'
```

**Returns:** `'mock' | 'real'`

---

#### `validateRealOAuthEnv()`
Validate real OAuth environment variables.

```typescript
const validation = validateRealOAuthEnv();
if (!validation.isValid) {
  console.error('Missing:', validation.missingVars);
}
```

**Returns:**
```typescript
{
  isValid: boolean;
  missingVars: string[];
  errors: string[];
  message: string;
}
```

**Errors if:**
- Missing `LINKEDIN_TEST_EMAIL`
- Missing `LINKEDIN_TEST_PASSWORD`
- Empty credentials

---

#### `getLinkedInConfig()`
Get type-safe LinkedIn OAuth configuration.

```typescript
const config = getLinkedInConfig();
console.log(config.email);
```

**Returns:**
```typescript
{
  readonly mode: 'mock' | 'real';
  readonly email: string;
  readonly password: string;
  readonly baseUrl: string;
  readonly isHeadless: boolean;
}
```

---

#### `logConfiguration()`
Log current configuration (sanitized).

```typescript
logConfiguration();
// Output:
// OAuth Mode: mock
// Mocking Enabled: true
```

**Returns:** `void`

---

### Test Cleanup (`helpers/test-cleanup.ts`)

#### `disconnectAllIntegrations(page)`
Disconnect all test integrations.

```typescript
await disconnectAllIntegrations(page);
```

**Parameters:**
- `page` (Page) - Playwright page object

**Returns:** `Promise<void>`

**Throws:** Never (graceful failures)

---

#### `disconnectIntegration(page, name)`
Disconnect specific integration.

```typescript
await disconnectIntegration(page, 'linkedin');
await disconnectIntegration(page, 'twitter');
await disconnectIntegration(page, 'facebook');
```

**Parameters:**
- `page` (Page) - Playwright page object
- `name` ('linkedin' | 'twitter' | 'facebook') - Integration name

**Returns:** `Promise<void>`

---

#### `clearAllTestData(page)`
Clear all test data.

```typescript
await clearAllTestData(page);
```

**Parameters:**
- `page` (Page) - Playwright page object

**Returns:** `Promise<void>`

---

#### `waitForNetworkIdle(page)`
Wait for network requests to complete.

```typescript
await page.click('button');
await waitForNetworkIdle(page);
```

**Parameters:**
- `page` (Page) - Playwright page object

**Returns:** `Promise<void>`

---

#### `getIntegrationStatus(page)`
Get current integration status.

```typescript
const status = await getIntegrationStatus(page);
console.log(status.linkedin); // true or false
```

**Returns:**
```typescript
{
  linkedin: boolean;
  twitter: boolean;
  facebook: boolean;
}
```

---

#### `assertAllDisconnected(page)`
Assert all integrations are disconnected.

```typescript
await assertAllDisconnected(page);
// Throws if any integration is connected
```

**Parameters:**
- `page` (Page) - Playwright page object

**Returns:** `Promise<void>`

**Throws:** If any integration is connected

---

### LinkedIn Mocks (`helpers/linkedin-mock.ts`)

#### `setupLinkedInMocks(page)`
Setup LinkedIn OAuth mocks.

```typescript
await setupLinkedInMocks(page);
```

**Parameters:**
- `page` (Page) - Playwright page object

**Returns:** `Promise<void>`

**What it mocks:**
- LinkedIn OAuth responses
- User profile requests
- Token generation

---

#### `setupLinkedInMocksWithError(page, errorCode)`
Setup LinkedIn mocks with error response.

```typescript
await setupLinkedInMocksWithError(page, 'invalid_credentials');
```

**Parameters:**
- `page` (Page) - Playwright page object
- `errorCode` (string) - Error code to simulate

**Returns:** `Promise<void>`

**Error codes:**
- `invalid_credentials` - Login failed
- `access_denied` - Permission denied
- `server_error` - Server error

---

## 📄 Page Objects

### IntegrationsPage (`pages/settings/IntegrationsPage.ts`)

#### Constructor

```typescript
const integrationsPage = new IntegrationsPage(page);
```

---

#### `navigate()`
Navigate to Integrations page.

```typescript
await integrationsPage.navigate();
```

**Returns:** `Promise<void>`

---

#### `connectLinkedIn()`
Connect LinkedIn account.

```typescript
await integrationsPage.connectLinkedIn();
```

**Returns:** `Promise<void>`

**Handles:**
- Clicking connect button
- OAuth popup
- Waiting for connection

---

#### `disconnectLinkedIn()`
Disconnect LinkedIn account.

```typescript
await integrationsPage.disconnectLinkedIn();
```

**Returns:** `Promise<void>`

**Handles:**
- Finding disconnect button
- Clicking button
- Waiting for disconnection

---

#### `isLinkedInConnected()`
Check if LinkedIn is connected.

```typescript
const connected = await integrationsPage.isLinkedInConnected();
if (connected) {
  console.log('LinkedIn connected');
}
```

**Returns:** `Promise<boolean>`

---

#### `getLinkedInStatus()`
Get detailed LinkedIn status.

```typescript
const status = await integrationsPage.getLinkedInStatus();
// {
//   connected: true,
//   accountName: 'John Doe',
//   email: 'john@example.com'
// }
```

**Returns:** `Promise<{ connected: boolean; accountName?: string; email?: string }>`

---

#### `getConnectionError()`
Get connection error message if any.

```typescript
const error = await integrationsPage.getConnectionError();
console.log(error);
```

**Returns:** `Promise<string | null>`

---

## 🔧 Test Fixtures

### Base Fixtures (`fixtures/base.ts`)

#### `authenticatedPage`
Page with user already authenticated.

```typescript
test('with auth', async ({ authenticatedPage }) => {
  await authenticatedPage.goto('/dashboard');
});
```

**Setup:**
- User logged in
- Session active
- Ready to use

---

#### `integrationsPage`
Integrations page object ready to use.

```typescript
test('integrations', async ({ integrationsPage }) => {
  await integrationsPage.navigate();
});
```

---

## 📚 TypeScript Types

### OAuthMode
```typescript
type OAuthMode = 'mock' | 'real';
```

---

### LinkedInOAuthConfig
```typescript
interface LinkedInOAuthConfig {
  readonly mode: OAuthMode;
  readonly email: string;
  readonly password: string;
  readonly baseUrl: string;
  readonly isHeadless: boolean;
}
```

---

### ValidationResult
```typescript
interface ValidationResult {
  isValid: boolean;
  missingVars: string[];
  errors: string[];
  message: string;
}
```

---

### IntegrationName
```typescript
type IntegrationName = 'linkedin' | 'twitter' | 'facebook';
```

---

### CleanupResult
```typescript
interface CleanupResult {
  success: boolean;
  disconnected: IntegrationName[];
  failed: IntegrationName[];
  duration: number;
}
```

---

## 🎯 Usage Examples

### Complete OAuth Test

```typescript
import { test, expect } from '@playwright/test';
import { IntegrationsPage } from '../pages/settings/IntegrationsPage';
import { disconnectAllIntegrations } from '../helpers/test-cleanup';

test('OAuth flow', async ({ authenticatedPage }) => {
  // Setup
  const integrationsPage = new IntegrationsPage(authenticatedPage);
  await integrationsPage.navigate();
  
  // Connect
  await integrationsPage.connectLinkedIn();
  expect(await integrationsPage.isLinkedInConnected()).toBe(true);
  
  // Verify
  const status = await integrationsPage.getLinkedInStatus();
  expect(status.connected).toBe(true);
  
  // Cleanup
  await integrationsPage.disconnectLinkedIn();
  expect(await integrationsPage.isLinkedInConnected()).toBe(false);
});
```

### OAuth with Config Validation

```typescript
import { validateRealOAuthEnv, getLinkedInConfig } from '../helpers/oauth-config';

test('validate oauth', async () => {
  const validation = validateRealOAuthEnv();
  
  if (!validation.isValid) {
    console.log('Missing:', validation.missingVars);
    console.log('Errors:', validation.errors);
  }
  
  const config = getLinkedInConfig();
  console.log('Using mode:', config.mode);
});
```

### OAuth with Error Handling

```typescript
test('oauth error handling', async ({ authenticatedPage }) => {
  const integrationsPage = new IntegrationsPage(authenticatedPage);
  
  try {
    await integrationsPage.connectLinkedIn();
  } catch (error) {
    const errorMsg = await integrationsPage.getConnectionError();
    console.log('Connection failed:', errorMsg);
  }
});
```

---

## 🔍 Debugging

### Enable Debug Logging

```bash
# Run with debug output
DEBUG=pw:api npm test

# Run specific test with debug
PWDEBUG=1 npx playwright test -g "test name"
```

### Check Configuration

```typescript
import { getLinkedInConfig, logConfiguration } from './helpers/oauth-config';

logConfiguration();
const config = getLinkedInConfig();
console.log('Current config:', config);
```

---

## ⚠️ Common Errors

### "Missing LINKEDIN_TEST_EMAIL"
```
Error: Configuration error - missing LINKEDIN_TEST_EMAIL

Fix:
1. Create .env file
2. Add: LINKEDIN_TEST_EMAIL=your-email@example.com
3. Add: LINKEDIN_TEST_PASSWORD=your-password
4. Add: OAUTH_MODE=real
```

### "IntegrationsPage not found"
```
Error: Cannot find module

Fix:
1. Check file path
2. Verify file exists: pages/settings/IntegrationsPage.ts
3. Check imports are correct
```

### "Page is not connected"
```
Error: LinkedIn not connecting

Fix:
1. Check .env configuration
2. Verify credentials are correct
3. Check network connection
4. Try mock mode first
```

---

**Need more help?** See [Troubleshooting Guide](../guides/TROUBLESHOOTING.md)
