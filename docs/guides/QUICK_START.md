# Quick Start Guide

Get started with the BuzzPotato E2E testing suite in 5 minutes.

## ⚡ 5-Minute Setup

### 1. Clone Repository
```bash
git clone https://github.com/waqarland/buzzpotato-e2e-tests.git
cd buzzpotato-e2e-tests
```

### 2. Install Dependencies
```bash
npm install
npx playwright install --with-deps
```

### 3. Setup Environment
```bash
# Copy example config
cp .env.example .env

# Edit .env with your settings
# For testing: OAUTH_MODE=mock (uses mock LinkedIn)
# For production: OAUTH_MODE=real (requires LinkedIn credentials)
```

### 4. Run Tests
```bash
# Mock mode (recommended for CI/CD)
npm test

# Or run with UI mode
npx playwright test --ui

# Or headed mode (see browser)
npx playwright test --headed
```

✅ **Done!** All tests should pass.

---

## 🎯 Common Commands

```bash
# Run all tests
npm test

# Run specific test file
npx playwright test tests/integration/linkedin-oauth-simple.spec.ts

# Run with UI
npx playwright test --ui

# Run headed (see browser)
npx playwright test --headed

# Debug mode
npx playwright test --debug

# View test report
npx playwright show-report

# Run single test
npx playwright test -g "should successfully connect"
```

---

## 📁 Project Structure

```
buzzpotato-e2e-tests/
├── tests/                 # Test files
├── helpers/              # Helper utilities
├── pages/                # Page objects
├── fixtures/             # Test fixtures
├── docs/                 # This documentation
├── playwright.config.ts  # Playwright config
└── package.json         # Dependencies
```

---

## 🔐 Environment Setup

**For Mock OAuth (Recommended):**
```bash
OAUTH_MODE=mock
MOCK_OAUTH_ENABLED=true
```

**For Real OAuth (Production):**
```bash
OAUTH_MODE=real
MOCK_OAUTH_ENABLED=false
LINKEDIN_TEST_EMAIL=your-email@example.com
LINKEDIN_TEST_PASSWORD=your-password
```

---

## ✅ Verification

After setup, verify everything works:

```bash
# Should show 6 tests passing
npm test
```

Expected output:
```
✅ linkedin-oauth-simple.spec.ts (2 tests)
✅ cleanup-disconnect-linkedin.spec.ts (1 test)
✅ linkedin-oauth-real.spec.ts (1+ tests)
✅ linkedin-oauth.spec.ts (2+ tests)

Total: 6/6 passing ✓
```

---

## 📖 Next Steps

- Read [Installation Guide](./INSTALLATION.md) for detailed setup
- See [Testing Guide](../tutorials/TESTING_GUIDE.md) for running tests
- Check [OAuth Configuration](./LINKEDIN_OAUTH.md) for authentication
- Review [Troubleshooting](./TROUBLESHOOTING.md) if issues arise

---

**Still stuck?** See [Troubleshooting Guide](./TROUBLESHOOTING.md)
