# Cache Sticky Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-09-20

## Active Technologies
- TypeScript (ES2020+) compiled to JavaScript (001-project-cache-sticky)
- HTML5, CSS3, Cache API, Vite for bundling (001-project-cache-sticky)
- Jest for unit tests, Playwright for e2e tests (001-project-cache-sticky)

## Project Structure
```
src/
├── models/
├── services/
├── components/
└── lib/

tests/
├── contract/
├── integration/
└── unit/
```

## Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run test         # Run unit tests
npm run test:e2e     # Run e2e tests
npm run lint         # Check code quality
npm run format       # Fix formatting
npm run type-check   # TypeScript validation
```

## Code Style
- TypeScript with strict configuration
- ESLint + Prettier for formatting
- 90%+ test coverage required
- TDD approach (tests before implementation)

## Constitution Requirements
- Code quality: ESLint, Prettier, code reviews
- Testing: 90% coverage, unit + integration + e2e
- Performance: <2s page load, smooth interactions
- UX: Consistent design, user-friendly errors
- Security: Input validation, XSS prevention

## Recent Changes
- 001-project-cache-sticky: Added TypeScript + Cache API + Vite + Testing setup

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->