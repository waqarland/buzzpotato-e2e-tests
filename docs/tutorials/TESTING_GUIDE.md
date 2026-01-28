# Testing Guide

How to run, write, and debug tests.

## 🚀 Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run specific test file
npx playwright test tests/integration/linkedin-oauth-simple.spec.ts

# Run tests matching pattern
npx playwright test -g "should successfully connect"

# Run single test
npx playwright test --grep "exact test name"
```

### Modes

```bash
# Headless (default, no browser window)
npm test

# Headed (see browser window)
npx playwright test --headed

# UI mode (interactive dashboard)
npx playwright test --ui

# Debug mode (step through)
npx playwright test --debug

# Slow motion (slow down actions)
npx playwright test --headed --slow-mo=1000
```

### Reporting

```bash
# Verbose output
npm test -- --reporter=verbose

# List format
npm test -- --reporter=list

# HTML report
npm test -- --reporter=html
npx playwright show-report

# JUnit (CI/CD)
npm test -- --reporter=junit
```

---

## 📝 Test Structure

### File Organization

```
tests/
├── integration/        # Real LinkedIn OAuth tests
├── e2e/               # End-to-end workflows
├── regression/        # Regression tests
└── smoke/             # Quick smoke tests
```

### Test File Template

```typescript
import { test, expect } from '@playwright/test';
import { authenticatedPage } from '../fixtures/base';

test.describe('Feature Name', () => {
  
  test('should do something', async ({ page }) => {
    // 1. ARRANGE - Setup
    await page.goto('/dashboard');
    
    // 2. ACT - Do something
    await page.click('button');
    
    // 3. ASSERT - Verify
    await expect(page.locator('element')).toBeVisible();
  });
  
});
```

### Using Fixtures

```typescript
test('with authenticated page', async ({ authenticatedPage }) => {
  // authenticatedPage comes with auth already set up
  const page = authenticatedPage;
  await page.goto('/integrations');
});

test('with page objects', async ({ integrationsPage }) => {
  // Page object provides methods for UI interaction
  await integrationsPage.connectLinkedIn();
  await expect(integrationsPage.isLinkedInConnected()).toBe(true);
});
```

---

## 🔧 OAuth Testing

### Mock Mode (Recommended for CI/CD)

```typescript
test('with mock OAuth', async ({ authenticatedPage }) => {
  // Uses mocked LinkedIn responses
  // No real credentials needed
  // Fast execution
});
```

Set in `.env`:
```env
OAUTH_MODE=mock
MOCK_OAUTH_ENABLED=true
```

### Real Mode (Production Testing)

```typescript
test('with real OAuth', async ({ authenticatedPage }) => {
  // Uses real LinkedIn
  // Requires valid credentials
  // Slower execution
  // More realistic
});
```

Set in `.env`:
```env
OAUTH_MODE=real
MOCK_OAUTH_ENABLED=false
LINKEDIN_TEST_EMAIL=your-email@example.com
LINKEDIN_TEST_PASSWORD=your-password
```

---

## 🧪 Test Examples

### Simple Assertion

```typescript
test('should display button', async ({ page }) => {
  await page.goto('/');
  const button = page.getByRole('button', { name: 'Click me' });
  await expect(button).toBeVisible();
});
```

### Wait for Element

```typescript
test('should wait for modal', async ({ page }) => {
  await page.click('button');
  
  // Wait for modal to appear
  const modal = page.getByRole('dialog');
  await expect(modal).toBeVisible();
});
```

### Fill Form

```typescript
test('should fill and submit form', async ({ page }) => {
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  
  await expect(page).toHaveURL('/dashboard');
});
```

### OAuth Flow

```typescript
test('should connect LinkedIn', async ({ page, authenticatedPage }) => {
  const integrationsPage = new IntegrationsPage(page);
  
  // Connect LinkedIn
  await integrationsPage.connectLinkedIn();
  
  // Verify connected
  const isConnected = await integrationsPage.isLinkedInConnected();
  expect(isConnected).toBe(true);
  
  // Cleanup
  await integrationsPage.disconnectLinkedIn();
});
```

---

## 🐛 Debugging

### Debug Mode

```bash
npx playwright test --debug
```

Features:
- Step through code line by line
- Inspect DOM elements
- View network requests
- Check console logs
- Pause at breakpoints

### Using Inspector

```bash
PWDEBUG=1 npx playwright test tests/integration/linkedin-oauth-simple.spec.ts
```

Inspector opens automatically to step through tests.

### Console Logs

```typescript
test('with logging', async ({ page }) => {
  console.log('Starting test');
  
  await page.goto('/');
  console.log('Navigated to home');
  
  const button = page.getByRole('button');
  console.log('Button found:', button);
});

// Run with:
npm test -- --reporter=verbose
```

### Screenshots on Failure

```typescript
test('with screenshot on fail', async ({ page }) => {
  try {
    await expect(page.locator('selector')).toBeVisible();
  } catch (e) {
    await page.screenshot({ path: 'failure.png' });
    throw e;
  }
});
```

Screenshots saved to `test-results/`

### Codegen (Record Tests)

```bash
npx playwright codegen http://localhost:3000
```

- Records browser interactions
- Generates test code automatically
- Interactive recording

---

## ⚙️ Test Configuration

### Playwright Config

File: `playwright.config.ts`

```typescript
export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
  fullyParallel: true,
  retries: 1,
  workers: 4,
  reporter: 'html',
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: false,
  },
});
```

### Key Settings

| Option | Purpose |
|--------|---------|
| `timeout` | Test timeout in ms |
| `retries` | Retry failed tests |
| `workers` | Parallel test count |
| `reporter` | Output format |
| `webServer` | Start dev server |

---

## 🔄 Test Lifecycle

### Setup (test.beforeEach)

```typescript
test.beforeEach(async ({ page }) => {
  // This runs before each test
  await page.goto('/');
  await loginUser(page);
});
```

### Cleanup (test.afterEach)

```typescript
test.afterEach(async ({ page }) => {
  // This runs after each test
  await disconnectAllIntegrations(page);
  await logoutUser(page);
});
```

### Group Hooks (test.describe.beforeAll)

```typescript
test.describe('OAuth Tests', () => {
  test.beforeAll(async () => {
    // Runs once before all tests in group
  });
  
  test.afterAll(async () => {
    // Runs once after all tests in group
  });
  
  test('test 1', async () => {});
  test('test 2', async () => {});
});
```

---

## 📊 Test Metrics

### Running Tests

```bash
# With timing
npm test -- --reporter=verbose

# Example output:
# ✓ should connect LinkedIn (4.5s)
# ✓ should disconnect LinkedIn (2.1s)
# Total: 2 passed (6.6s)
```

### Coverage

Current test coverage:
- OAuth: 100% (real + mock modes)
- Integrations page: 100%
- Cleanup utilities: 100%

---

## 🎯 Best Practices

✅ **DO:**
- Use `getByRole()` for selectors
- Wait for elements, not timeouts
- Test real user flows
- Use Page Objects for UI interaction
- Clean up after tests
- Use descriptive test names

❌ **DON'T:**
- Use CSS selectors if role available
- Use `waitForTimeout()`
- Test implementation details
- Hardcode wait times
- Leave data after tests
- Use vague test names

---

## 💡 Tips

- Use `--ui` mode for interactive development
- Use `--debug` mode for troubleshooting
- Use `--headed` mode to see what's happening
- Use `codegen` to record interactions
- Start with mock mode, switch to real later
- Keep tests independent (no dependencies)

---

**More help?** See [Troubleshooting Guide](./TROUBLESHOOTING.md)
