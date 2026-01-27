# BuzzPotato E2E Test Automation Framework

![Tests](https://github.com/waqarland/buzzpotato-e2e-tests/workflows/E2E%20Tests/badge.svg)
![Playwright](https://img.shields.io/badge/Playwright-45ba4b?style=flat&logo=playwright&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)

> Professional end-to-end testing framework for [BuzzPotato](https://buzzpotato.online) - an AI-powered social media content generation platform

[📊 View Latest Test Report](https://waqarland.github.io/buzzpotato-e2e-tests/)

---

## 🎯 About This Project

This repository showcases **modern Playwright automation practices** (2024-2026) including:

- ✅ **Fixture-based architecture** - Clean, reusable test setup
- ✅ **Lightweight Page Objects** - Simple locators, no heavy logic  
- ✅ **App Actions pattern** - Fast test execution via API
- ✅ **CI/CD integration** - Automated runs after every deployment
- ✅ **Visual regression testing** - Catch UI changes automatically
- ✅ **Parallel execution** - Fast feedback loops

---

## 🏗️ Architecture

### Fixture-Based Approach (Modern Best Practice)

Instead of traditional `beforeEach/afterEach`, we use Playwright's powerful fixture system:

```typescript
// Automatic setup/teardown, shared across tests
test('my test', async ({ authenticatedPage, createPostPage }) => {
  // Already logged in, ready to test!
  await createPostPage.generatePost('AI testing tips');
});
```

### Lightweight Page Objects

Following Playwright team recommendations - pages contain **only locators and simple actions**:

```typescript
export class LoginPage {
  readonly emailInput = page.getByLabel('Email');
  readonly loginButton = page.getByRole('button', { name: 'Login' });
  
  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    // ... simple actions only
  }
}
```

---

## 📁 Project Structure

```
buzzpotato-e2e-tests/
├── fixtures/          # Reusable test fixtures
├── pages/             # Lightweight page objects
├── tests/
│   ├── smoke/        # Critical path tests (fast)
│   ├── auth/         # Authentication flows
│   ├── posts/        # Post generation & editing
│   └── settings/     # User settings
├── utils/            # Helper functions
└── .github/workflows/ # CI/CD automation
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/waqarland/buzzpotato-e2e-tests.git
cd buzzpotato-e2e-tests

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install chromium
```

### Running Tests

```bash
# Run all tests
npm test

# Run smoke tests only (fast)
npm run test:smoke

# Run in headed mode (see the browser)
npm run test:headed

# Debug mode
npm run test:debug

# Interactive UI mode
npm run test:ui

# View last test report
npm run report
```

---

## 📊 Test Coverage

### Critical User Journeys
- ✅ User signup & email verification
- ✅ User login & authentication
- ✅ Onboarding flow (platforms, goals, tone)
- ✅ Post generation (Topic, Idea, Source modes)
- ✅ LinkedIn integration & publishing
- ✅ Draft management
- ✅ Scheduled posts

### Test Metrics
- **Total Tests**: 25+
- **Execution Time**: < 5 minutes (parallel)
- **Coverage**: 80%+ critical paths

---

## 🔄 CI/CD Integration

Tests run automatically:
- ✅ After every production deployment
- ✅ Every 6 hours (scheduled)
- ✅ On pull requests
- ✅ Manual trigger available

View workflow: [`.github/workflows/post-deployment.yml`](.github/workflows/post-deployment.yml)

---

## 📈 Test Reports

Latest test results are automatically published to GitHub Pages:

**[View Live Report →](https://waqarland.github.io/buzzpotato-e2e-tests/)**

Reports include:
- Test execution summary
- Screenshots on failure
- Video recordings
- Trace files for debugging

---

## 💡 Skills Demonstrated

This project showcases professional QA automation expertise:

- **Modern Testing Practices** - Fixture-based, API-first approach
- **TypeScript** - Strongly typed, maintainable code
- **CI/CD** - GitHub Actions integration
- **Test Design** - Page Object Model, reusable fixtures
- **Web Technologies** - Next.js, React, Supabase testing
- **API Testing** - REST API validation
- **Visual Testing** - Screenshot comparisons

---

## 🛠️ Technologies

- [Playwright](https://playwright.dev/) - Modern E2E testing framework
- TypeScript - Type-safe test code
- GitHub Actions - CI/CD automation
- ESLint & Prettier - Code quality
- Node.js 20+ - Runtime

---

## 📝 Best Practices Implemented

1. **Semantic Locators** - `getByRole`, `getByLabel` over CSS/XPath
2. **Auto-waiting** - Playwright's built-in waiting mechanisms
3. **Isolation** - Each test runs independently
4. **Fast Execution** - API-based setup, parallel runs
5. **Visual Regression** - Catch unexpected UI changes
6. **Comprehensive Reporting** - HTML, JSON, JUnit formats

---

## 📞 Contact

**Waqar** - Software Test Engineer

- GitHub: [@waqarland](https://github.com/waqarland)
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/yourprofile)

---

## 📄 License

MIT

---

## ⭐ About BuzzPotato

BuzzPotato is an AI-powered platform that helps users generate engaging social media content for LinkedIn, Twitter, and other platforms. Built with Next.js, React, and Google Gemini AI.

[Learn more about BuzzPotato →](https://buzzpotato.online)
