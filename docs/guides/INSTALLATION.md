# Installation & Setup Guide

Complete step-by-step installation and configuration instructions.

## 📋 Prerequisites

- **Node.js:** v16 or higher (v18+ recommended)
- **npm:** v7 or higher
- **Git:** Latest version
- **Operating System:** Windows, macOS, or Linux

Verify prerequisites:
```bash
node --version    # Should be v16+
npm --version     # Should be v7+
git --version     # Should be latest
```

---

## 🔧 Installation Steps

### Step 1: Clone Repository

```bash
git clone https://github.com/waqarland/buzzpotato-e2e-tests.git
cd buzzpotato-e2e-tests
```

### Step 2: Install Dependencies

```bash
# Install npm packages
npm install

# Install Playwright browsers and dependencies
npx playwright install --with-deps
```

**What gets installed:**
- Playwright (E2E testing framework)
- TypeScript (Type safety)
- ESLint (Code linting)
- All required browser versions

### Step 3: Verify Installation

```bash
# Check Playwright is installed
npx playwright --version

# Should output: Version X.XX.X
```

### Step 4: Environment Configuration

Create `.env` file:

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```env
# OAuth Mode: 'mock' or 'real'
OAUTH_MODE=mock

# Mock OAuth toggle
MOCK_OAUTH_ENABLED=true

# LinkedIn credentials (for real OAuth)
LINKEDIN_TEST_EMAIL=your-email@example.com
LINKEDIN_TEST_PASSWORD=your-password

# Application URL
BASE_URL=http://localhost:3000

# Browser settings
HEADLESS=true
SLOW_MO=0
```

### Step 5: Run First Test

```bash
npm test
```

Expected output:
```
Running 6 tests...
✅ All tests passed
Duration: ~75 seconds
```

---

## 🎯 Configuration Details

### OAUTH_MODE Options

| Mode | Use Case | Speed | Setup |
|------|----------|-------|-------|
| `mock` | Development, CI/CD | Fast (~60s) | No credentials needed |
| `real` | Production testing | Medium (~90s) | LinkedIn credentials needed |

### Environment Variables

| Variable | Required | Default | Notes |
|----------|----------|---------|-------|
| `OAUTH_MODE` | ✅ Yes | `mock` | 'mock' or 'real' |
| `MOCK_OAUTH_ENABLED` | ✅ Yes | `true` | Mock mode toggle |
| `LINKEDIN_TEST_EMAIL` | For real | ❌ None | Your test account email |
| `LINKEDIN_TEST_PASSWORD` | For real | ❌ None | Your test account password |
| `BASE_URL` | Optional | `http://localhost:3000` | Application URL |
| `HEADLESS` | Optional | `true` | Run headless (no UI) |
| `SLOW_MO` | Optional | `0` | Slow down by N ms |

---

## 🔒 Security Notes

- ✅ `.env` file is in `.gitignore` (never committed)
- ✅ Never hardcode credentials in code
- ✅ Use `.env` for all sensitive data
- ✅ Each developer needs their own `.env`
- ✅ For CI/CD, use GitHub Actions secrets

---

## ✅ Verification Checklist

After installation, verify:

```bash
# ✅ Check Node.js
node --version

# ✅ Check npm
npm --version

# ✅ Check Playwright
npx playwright --version

# ✅ Check TypeScript
npx tsc --version

# ✅ Run tests
npm test

# ✅ Run in UI mode
npx playwright test --ui
```

All commands should complete successfully.

---

## 🐛 Troubleshooting Installation

### Issue: "playwright not found"
```bash
Solution:
npm install
npx playwright install --with-deps
```

### Issue: "Cannot find module 'typescript'"
```bash
Solution:
npm install --save-dev typescript
```

### Issue: "Port 3000 already in use"
```bash
Solution:
# Change BASE_URL in .env to different port:
BASE_URL=http://localhost:3001
```

### Issue: "Tests timeout"
```bash
Solution:
# Increase timeout in .env:
# Add: TEST_TIMEOUT=60000
```

See [Troubleshooting Guide](./TROUBLESHOOTING.md) for more issues.

---

## 📁 After Installation

Your project structure should look like:

```
buzzpotato-e2e-tests/
├── .env                    # Your configuration (CREATED)
├── node_modules/           # Dependencies (CREATED)
├── tests/
│   ├── integration/        # Integration tests
│   ├── e2e/               # End-to-end tests
│   ├── regression/        # Regression tests
│   └── smoke/             # Smoke tests
├── helpers/               # Test helpers
├── pages/                 # Page objects
├── fixtures/              # Test fixtures
├── docs/                  # Documentation
├── playwright.config.ts   # Playwright config
├── tsconfig.json         # TypeScript config
├── package.json          # Dependencies
└── README.md             # Project README
```

---

## 🚀 Next Steps

1. **Read** [Quick Start Guide](./QUICK_START.md) for basic usage
2. **Explore** [Testing Guide](../tutorials/TESTING_GUIDE.md) to run tests
3. **Configure** [OAuth](./LINKEDIN_OAUTH.md) for your needs
4. **Read** [Test Architecture](../api/TEST_ARCHITECTURE.md) to understand structure

---

## 💡 Tips

- Keep `.env` out of version control (already in `.gitignore`)
- Use `npm test` for quick testing
- Use `--ui` mode for debugging
- Check [Troubleshooting](./TROUBLESHOOTING.md) if stuck

---

**Ready?** Try [Quick Start Guide](./QUICK_START.md) next!
