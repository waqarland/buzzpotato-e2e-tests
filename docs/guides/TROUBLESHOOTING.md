# Troubleshooting Guide

Common issues and solutions.

## 🔴 Test Failures

### "Tests timeout"

**Error:** `Timeout of 30000ms exceeded`

**Causes:**
- Network too slow
- Element not loading
- Selector is incorrect
- LinkedIn page layout changed

**Solutions:**

```bash
# 1. Run headed to see what's happening
npx playwright test --headed

# 2. Run in debug mode
npx playwright test --debug

# 3. Increase timeout in playwright.config.ts
timeout: 60000  // Increase to 60 seconds

# 4. Check if selectors work
npx playwright codegen http://localhost:3000
```

---

### "Element not found"

**Error:** `Locator.click: no matching element was found`

**Causes:**
- Selector has changed
- Element not visible
- Page not loaded
- Strict mode violation

**Solutions:**

```bash
# 1. Debug mode to inspect
npx playwright test --debug

# 2. Use codegen to find selector
npx playwright codegen http://localhost:3000

# 3. Check element is visible
await page.waitForSelector('selector');

# 4. Use Playwright Inspector
PWDEBUG=1 npx playwright test
```

---

### "OAuth connection fails"

**Error:** LinkedIn OAuth not connecting

**Causes:**
- Wrong credentials
- OAuth mode mismatch
- Network issue
- LinkedIn UI changed

**Solutions:**

```bash
# 1. Check .env configuration
cat .env

# 2. Switch to mock mode (for testing)
OAUTH_MODE=mock
MOCK_OAUTH_ENABLED=true

# 3. Verify credentials work in browser manually
# Visit BuzzPotato app, try connecting manually

# 4. Run with headed mode to see OAuth flow
npx playwright test --headed

# 5. Check network tab for errors
npx playwright test --debug
```

---

## 🟡 Installation Issues

### "npm: command not found"

**Error:** Command not found

**Solution:**
```bash
# Install Node.js from https://nodejs.org/
# Then verify:
node --version
npm --version
```

---

### "playwright: command not found"

**Error:** `Command not found: npx playwright`

**Solution:**
```bash
# Reinstall Playwright
npm install
npx playwright install --with-deps
```

---

### "Cannot find module 'typescript'"

**Error:** `Cannot find module 'typescript'`

**Solution:**
```bash
npm install --save-dev typescript
```

---

### "Port already in use"

**Error:** `Error: listen EADDRINUSE: address already in use :::3000`

**Solution:**
```bash
# Option 1: Kill process on port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Option 2: Use different port
# Change BASE_URL in .env to http://localhost:3001
```

---

### "Out of memory"

**Error:** `JavaScript heap out of memory`

**Solution:**
```bash
# Increase memory limit
NODE_OPTIONS=--max-old-space-size=4096 npm test
```

---

## 🟡 Configuration Issues

### ".env file not found"

**Error:** Configuration not loading

**Solution:**
```bash
# Create .env file
cp .env.example .env

# Verify .env exists
ls -la .env
```

---

### "Invalid credentials"

**Error:** LinkedIn authentication fails

**Solution:**
```bash
# Verify credentials in .env
cat .env | grep LINKEDIN

# Test manually:
# 1. Open browser
# 2. Go to LinkedIn
# 3. Try logging in with LINKEDIN_TEST_EMAIL/PASSWORD
# 4. If it fails, update credentials
```

---

### "OAUTH_MODE not working"

**Error:** Wrong OAuth mode running

**Solution:**
```bash
# Verify .env is being read
npm test -- --reporter=verbose

# Check current mode
# Add this to test:
console.log('OAUTH_MODE:', process.env.OAUTH_MODE);
```

---

## 🟡 Runtime Issues

### "Flaky tests"

**Error:** Tests pass sometimes, fail sometimes

**Causes:**
- Network issues
- Element timing issues
- Race conditions
- Server not responding

**Solutions:**

```bash
# 1. Run test multiple times
for i in {1..5}; do npm test; done

# 2. Add better waits
await page.waitForLoadState('networkidle');

# 3. Increase timeouts
await page.click('selector', { timeout: 10000 });

# 4. Use retry option
npx playwright test --retries=2
```

---

### "Memory leak"

**Error:** Memory keeps increasing

**Solution:**
```bash
# Run fewer tests
npx playwright test tests/integration/linkedin-oauth-simple.spec.ts

# Clear cache
rm -rf node_modules/.cache
```

---

### "Browser crash"

**Error:** Browser exits unexpectedly

**Solution:**
```bash
# 1. Update Playwright
npm install @playwright/test@latest

# 2. Reinstall browsers
npx playwright install --with-deps

# 3. Check for blocked popups (LinkedIn)
# Allow popups in test configuration
```

---

## 📊 Debugging Commands

### Run with Debug UI

```bash
npx playwright test --debug
```

Features:
- Step through tests
- Inspect DOM
- View network requests
- Check console logs

### Use Inspector

```bash
PWDEBUG=1 npx playwright test
```

### Generate Code

```bash
npx playwright codegen http://localhost:3000
```

Records interactions to generate test code.

### View Report

```bash
npx playwright show-report
```

Opens HTML report of last test run.

### Run Single Test

```bash
npx playwright test -g "test name"
```

### Run Specific File

```bash
npx playwright test tests/integration/linkedin-oauth-simple.spec.ts
```

### Run Headed (See Browser)

```bash
npx playwright test --headed
```

### Slow Motion

```bash
npx playwright test --headed --slow-mo=1000
```

Slows down each action by 1 second.

---

## 🔍 Common Solutions

### Check Test Output

```bash
# Verbose output
npm test -- --reporter=verbose

# List format
npm test -- --reporter=list
```

### Check Network

```bash
# Monitor network in debug mode
PWDEBUG=1 npx playwright test
# Then use Network tab
```

### View Screenshots

```bash
# Tests capture screenshots on failure
# Check: test-results/
```

### Check Logs

```bash
# Enable debug logs
DEBUG=pw:api npm test
```

---

## 📱 Browser-Specific Issues

### Chromium Issues

```bash
# Reinstall Chromium
npx playwright install chromium

# Run on Chromium only
npx playwright test --project=chromium
```

### Firefox Issues

```bash
# Reinstall Firefox
npx playwright install firefox

# Run on Firefox only
npx playwright test --project=firefox
```

---

## 🆘 Still Stuck?

1. Check test output carefully
2. Run with `--debug` flag
3. Review [Test Architecture](../api/TEST_ARCHITECTURE.md)
4. Check [Quick Start](./QUICK_START.md)
5. See [API Reference](../api/API_REFERENCE.md)

---

**More help?** Check inline code comments (JSDoc) in:
- `helpers/oauth-config.ts`
- `helpers/test-cleanup.ts`
- `pages/settings/IntegrationsPage.ts`
