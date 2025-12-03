# 🤖 Agent-Specific Prompts

This file contains ready-to-use prompts for different AI agents working on this codebase. Each prompt is tailored for a specific role and includes git setup instructions.

---

## 🔧 Setup Instructions (For ALL Agents)

**Before starting work, ensure git remote is configured:**

```bash
# Navigate to workspace
cd C:\Users\georgem\source\repos\aurora_invest_app\nextjs_space

# Check current remote (should show: https://github.com/GeorgeMcIntyre-Web/aurora_invest_app.git)
git remote -v

# If remote is not set or incorrect, set it:
git remote set-url origin https://github.com/GeorgeMcIntyre-Web/aurora_invest_app.git

# Or add if it doesn't exist:
git remote add origin https://github.com/GeorgeMcIntyre-Web/aurora_invest_app.git

# Verify remote is correct
git remote -v

# Ensure you have latest code
git fetch origin
git pull origin main
```

**Repository Information:**
- **Workspace Path**: `C:\Users\georgem\source\repos\aurora_invest_app\nextjs_space`
- **Git Remote URL**: `https://github.com/GeorgeMcIntyre-Web/aurora_invest_app.git`
- **Remote Name**: `origin`
- **Main Branch**: `main` (confirmed)
- **Documentation**: All agent guides are in the root of `nextjs_space/`
- **Quick Reference**: See `GIT_SETUP.md` for detailed git commands

---

## 📋 Agent Prompt Templates

### Agent 1: Domain Engine Specialist

```
You are working on the AuroraInvest Stock Analyzer codebase. Your role is to enhance the domain analysis engine.

**Context:**
- This is a Next.js 14 + TypeScript application for educational stock analysis
- The domain engine is in `lib/domain/auroraEngine.ts` and must remain PURE (no side effects)
- All types are defined in `lib/domain/AnalysisTypes.ts`

**Your Task:**
[SPECIFIC TASK - e.g., "Add ESG score analysis", "Improve valuation classification logic", "Add sector comparison"]

**Critical Constraints:**
1. Domain engine functions MUST be pure (no API calls, no side effects, deterministic)
2. All new types must be added to `AnalysisTypes.ts`
3. Follow existing function patterns (see JSDoc comments in auroraEngine.ts)
4. Use framework language only (no personalized financial advice)

**Documentation to Read:**
1. `AGENT_GUIDE.md` → "Task: Modify Analysis Heuristics" or "Task: Add a New Analysis Dimension"
2. `ARCHITECTURE.md` → "Domain Layer" section
3. `MODULE_BOUNDARIES.md` → "Domain Layer" boundaries
4. `CONTRIBUTING.md` → TypeScript guidelines and code patterns

**Git Setup:**
```bash
cd C:\Users\georgem\source\repos\aurora_invest_app\nextjs_space

# Verify remote is set (should show: https://github.com/GeorgeMcIntyre-Web/aurora_invest_app.git)
git remote -v

# If remote is not set, configure it:
# git remote add origin https://github.com/GeorgeMcIntyre-Web/aurora_invest_app.git

# Get latest code
git fetch origin
git pull origin main  # or 'master' - check with 'git branch -r'
```

**Before Submitting:**
- [ ] All functions are pure (no side effects)
- [ ] New types added to AnalysisTypes.ts
- [ ] JSDoc comments added for new functions
- [ ] No React dependencies in domain layer
- [ ] Framework language only (no "you should buy/sell")

**Files You'll Work With:**
- `lib/domain/auroraEngine.ts` - Analysis engine
- `lib/domain/AnalysisTypes.ts` - Type definitions
- `lib/data/mockData.ts` - May need to add mock data for new fields

Start by reading the relevant documentation, then implement your changes.
```

---

### Agent 2: UI Component Developer

```
You are working on the AuroraInvest Stock Analyzer codebase. Your role is to create or enhance UI components.

**Context:**
- This is a Next.js 14 + TypeScript + React application
- UI components are in `components/` directory
- Uses Tailwind CSS with theme variables (see `app/globals.css`)
- Uses Lucide React for icons

**Your Task:**
[SPECIFIC TASK - e.g., "Create ESG score card component", "Improve scenario chart visualization", "Add comparison view"]

**Critical Constraints:**
1. Components receive data via props (no direct API calls)
2. Use theme variables: `bg-ai-card`, `text-ai-text`, `text-ai-muted`, etc.
3. Handle missing data gracefully (return null or show placeholder)
4. Follow existing component patterns (see `fundamentals-card.tsx` for reference)

**Documentation to Read:**
1. `AGENT_GUIDE.md` → "Task: Add a New UI Component"
2. `ARCHITECTURE.md` → "Presentation Layer" section
3. `MODULE_BOUNDARIES.md` → "Presentation Layer" boundaries
4. `CONTRIBUTING.md` → "Component Patterns" section

**Git Setup:**
```bash
cd C:\Users\georgem\source\repos\aurora_invest_app\nextjs_space

# Verify remote is set (should show: https://github.com/GeorgeMcIntyre-Web/aurora_invest_app.git)
git remote -v

# If remote is not set, configure it:
# git remote add origin https://github.com/GeorgeMcIntyre-Web/aurora_invest_app.git

# Get latest code
git fetch origin
git pull origin main  # or 'master' - check with 'git branch -r'
```

**Before Submitting:**
- [ ] Component follows existing patterns
- [ ] Uses theme variables (no hardcoded colors)
- [ ] Handles missing data gracefully
- [ ] TypeScript types properly defined
- [ ] No direct API calls (data via props only)

**Files You'll Work With:**
- `components/[your-component].tsx` - Your new/updated component
- `components/analysis-dashboard.tsx` - May need to integrate your component
- `app/globals.css` - Theme variables reference

Start by reading the relevant documentation, then implement your changes.
```

---

### Agent 3: API Integration Specialist

```
You are working on the AuroraInvest Stock Analyzer codebase. Your role is to integrate real market data APIs.

**Context:**
- Currently uses `MockMarketDataService` for development
- Service layer is in `lib/services/marketDataService.ts`
- Must implement `MarketDataService` interface
- Must map API responses to `StockData` type from `AnalysisTypes.ts`

**Your Task:**
[SPECIFIC TASK - e.g., "Integrate Alpha Vantage API", "Add Polygon.io integration", "Implement caching layer"]

**Critical Constraints:**
1. All API calls must go through service layer (no direct calls in components)
2. Map external API responses to `StockData` interface
3. Handle errors gracefully (rate limits, network failures, invalid tickers)
4. Never commit API keys (use environment variables)

**Documentation to Read:**
1. `AGENT_GUIDE.md` → "Task: Integrate a Real Market Data API"
2. `ARCHITECTURE.md` → "Service Layer" and "Integration Points" sections
3. `MODULE_BOUNDARIES.md` → "Service Layer" boundaries
4. `CONTRIBUTING.md` → "Security Guidelines" section

**Git Setup:**
```bash
cd C:\Users\georgem\source\repos\aurora_invest_app\nextjs_space

# Verify remote is set (should show: https://github.com/GeorgeMcIntyre-Web/aurora_invest_app.git)
git remote -v

# If remote is not set, configure it:
# git remote add origin https://github.com/GeorgeMcIntyre-Web/aurora_invest_app.git

# Get latest code
git fetch origin
git pull origin main  # or 'master' - check with 'git branch -r'
```

**Before Submitting:**
- [ ] Implements `MarketDataService` interface
- [ ] Maps API response to `StockData` type
- [ ] Error handling is user-friendly
- [ ] API keys in environment variables (not hardcoded)
- [ ] Updated `createMarketDataService()` factory if needed
- [ ] Documented required environment variables

**Files You'll Work With:**
- `lib/services/marketDataService.ts` - Service interface and implementations
- `.env.example` - Document required environment variables
- `lib/domain/AnalysisTypes.ts` - Type definitions (may need updates)

**Environment Variables:**
Create `.env.local` (not committed) with:
```
ALPHA_VANTAGE_API_KEY=your_key_here
# or
POLYGON_API_KEY=your_key_here
```

Start by reading the relevant documentation, then implement your changes.
```

---

### Agent 4: Application Orchestrator

```
You are working on the AuroraInvest Stock Analyzer codebase. Your role is to enhance the main application flow and orchestration.

**Context:**
- Main entry point is `app/page.tsx`
- Orchestrates between form input, data fetching, analysis, and display
- Manages application-level state (loading, errors, results)

**Your Task:**
[SPECIFIC TASK - e.g., "Improve error handling", "Add loading states", "Add result caching", "Add multi-stock comparison"]

**Critical Constraints:**
1. Orchestrates between layers (doesn't contain business logic)
2. Calls service layer for data, domain engine for analysis
3. Maps errors to user-friendly messages
4. Manages state at application level (not component level)

**Documentation to Read:**
1. `AGENT_GUIDE.md` → Relevant task sections
2. `ARCHITECTURE.md` → "Application Layer" section
3. `MODULE_BOUNDARIES.md` → "Application Layer" boundaries
4. `CONTRIBUTING.md` → "Error Handling" section

**Git Setup:**
```bash
cd C:\Users\georgem\source\repos\aurora_invest_app\nextjs_space

# Verify remote is set (should show: https://github.com/GeorgeMcIntyre-Web/aurora_invest_app.git)
git remote -v

# If remote is not set, configure it:
# git remote add origin https://github.com/GeorgeMcIntyre-Web/aurora_invest_app.git

# Get latest code
git fetch origin
git pull origin main  # or 'master' - check with 'git branch -r'
```

**Before Submitting:**
- [ ] No business logic in application layer
- [ ] Error messages are user-friendly
- [ ] Loading states properly managed
- [ ] Calls service layer (not direct API calls)
- [ ] Calls domain engine (not inline analysis logic)

**Files You'll Work With:**
- `app/page.tsx` - Main orchestration
- `components/stock-form.tsx` - May need updates for new features
- `components/analysis-dashboard.tsx` - May need updates for new features

Start by reading the relevant documentation, then implement your changes.
```

---

### Agent 5: Data & Testing Specialist

```
You are working on the AuroraInvest Stock Analyzer codebase. Your role is to enhance mock data, add tests, or improve data structures.

**Context:**
- Mock data is in `lib/data/mockData.ts`
- Domain types are in `lib/domain/AnalysisTypes.ts`
- Currently no test suite (you may need to set one up)

**Your Task:**
[SPECIFIC TASK - e.g., "Add more mock stocks", "Add unit tests for domain engine", "Improve data validation", "Add test fixtures"]

**Critical Constraints:**
1. Mock data must match `StockData` interface exactly
2. Tests should be pure and deterministic
3. Test domain engine functions with known inputs/outputs
4. Don't modify domain logic (only test it)

**Documentation to Read:**
1. `ARCHITECTURE.md` → "Data Layer" section
2. `MODULE_BOUNDARIES.md` → "Data Layer" boundaries
3. `CONTRIBUTING.md` → "Testing Guidelines" section
4. `lib/domain/AnalysisTypes.ts` - Understand data structures

**Git Setup:**
```bash
cd C:\Users\georgem\source\repos\aurora_invest_app\nextjs_space

# Verify remote is set (should show: https://github.com/GeorgeMcIntyre-Web/aurora_invest_app.git)
git remote -v

# If remote is not set, configure it:
# git remote add origin https://github.com/GeorgeMcIntyre-Web/aurora_invest_app.git

# Get latest code
git fetch origin
git pull origin main  # or 'master' - check with 'git branch -r'
```

**Before Submitting:**
- [ ] Mock data matches `StockData` interface
- [ ] Tests are deterministic (no random data)
- [ ] Test coverage for key functions
- [ ] Test edge cases (missing data, extreme values)

**Files You'll Work With:**
- `lib/data/mockData.ts` - Mock data
- `lib/domain/AnalysisTypes.ts` - Type definitions
- `lib/domain/auroraEngine.ts` - Functions to test
- `__tests__/` or `*.test.ts` - Test files (may need to create)

**If Setting Up Tests:**
Consider using Vitest (lightweight) or Jest:
```bash
npm install -D vitest @vitest/ui
# or
npm install -D jest @types/jest
```

Start by reading the relevant documentation, then implement your changes.
```

---

### Agent 6: Full-Stack Feature Developer

```
You are working on the AuroraInvest Stock Analyzer codebase. Your role is to implement a complete feature end-to-end.

**Context:**
- This requires changes across multiple layers (UI, domain, service, data)
- You need to coordinate changes across modules
- Follow the architecture patterns strictly

**Your Task:**
[SPECIFIC TASK - e.g., "Add portfolio analysis feature", "Add stock comparison view", "Add historical analysis"]

**Critical Constraints:**
1. Follow module boundaries (see MODULE_BOUNDARIES.md)
2. Domain logic stays pure (no side effects)
3. UI components receive data via props
4. Service layer handles all external data
5. Framework language only (no personalized advice)

**Documentation to Read:**
1. `AGENT_INDEX.md` - Start here for navigation
2. `ARCHITECTURE.md` - Complete system understanding
3. `MODULE_BOUNDARIES.md` - Understand boundaries
4. `AGENT_GUIDE.md` - Task-specific instructions
5. `CONTRIBUTING.md` - Code patterns

**Git Setup:**
```bash
cd C:\Users\georgem\source\repos\aurora_invest_app\nextjs_space

# Verify remote is set (should show: https://github.com/GeorgeMcIntyre-Web/aurora_invest_app.git)
git remote -v

# If remote is not set, configure it:
# git remote add origin https://github.com/GeorgeMcIntyre-Web/aurora_invest_app.git

# Get latest code
git fetch origin
git pull origin main  # or 'master' - check with 'git branch -r'

# Create feature branch
git checkout -b feature/[your-feature-name]
```

**Implementation Order:**
1. Update types in `AnalysisTypes.ts` (if needed)
2. Add domain logic in `auroraEngine.ts` (if needed)
3. Update service layer (if needed)
4. Create/update UI components
5. Wire everything together in `page.tsx` or `analysis-dashboard.tsx`

**Before Submitting:**
- [ ] All module boundaries respected
- [ ] Types defined in AnalysisTypes.ts
- [ ] Domain engine remains pure
- [ ] Error handling is user-friendly
- [ ] UI follows design system
- [ ] Framework language only

**Files You'll Work With:**
- Multiple files across layers (see MODULE_BOUNDARIES.md for guidance)

Start by reading AGENT_INDEX.md, then follow the implementation order above.
```

---

## 🔄 Multi-Agent Coordination Prompts

### When Multiple Agents Work Together

**Scenario: Adding a New Analysis Dimension**

**Agent A (Domain):**
```
You are implementing the domain logic for [NEW DIMENSION]. 
- Add analysis function to `lib/domain/auroraEngine.ts`
- Add types to `lib/domain/AnalysisTypes.ts` if needed
- Coordinate with Agent B on type definitions
- Wait for Agent B to define types first, then implement
```

**Agent B (Types):**
```
You are defining types for [NEW DIMENSION].
- Add new fields to `StockData` interface in `lib/domain/AnalysisTypes.ts`
- Add new fields to `AnalysisResult` interface
- Export all new types
- Coordinate with Agent A - define types FIRST before they implement
```

**Agent C (UI):**
```
You are creating the UI component for [NEW DIMENSION].
- Wait for Agent A and B to complete their work
- Create `components/[dimension]-card.tsx`
- Follow patterns from `fundamentals-card.tsx`
- Integrate into `components/analysis-dashboard.tsx`
```

**Agent D (Orchestration):**
```
You are integrating [NEW DIMENSION] into the main flow.
- Wait for Agents A, B, C to complete
- Wire new component into `components/analysis-dashboard.tsx`
- Ensure data flows correctly from domain → UI
```

---

## 📝 Git Workflow for Agents

### Standard Workflow

```bash
# 1. Verify remote is set
cd C:\Users\georgem\source\repos\aurora_invest_app\nextjs_space
git remote -v

# 2. Get latest code
git fetch origin
git pull origin main  # or master

# 3. Create feature branch
git checkout -b feature/[descriptive-name]

# 4. Make your changes
# ... work on your task ...

# 5. Commit with clear message
git add .
git commit -m "feat(scope): description of changes"

# 6. Push to remote
git push origin feature/[descriptive-name]

# 7. Create pull request (if using GitHub/GitLab)
```

### Commit Message Format

```
type(scope): short description

Longer description if needed
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `refactor`: Code restructuring
- `test`: Adding tests

**Examples:**
```
feat(analysis): add ESG score to analysis results
fix(ui): handle missing technical data gracefully
docs(agent): add agent guide for new analysis dimensions
```

---

## ✅ Pre-Submit Checklist (All Agents)

Before submitting your work:

- [ ] Git remote is configured correctly (`git remote -v`)
- [ ] Latest code pulled from remote (`git pull origin main`)
- [ ] Read relevant documentation (AGENT_INDEX.md → your task)
- [ ] Followed module boundaries (MODULE_BOUNDARIES.md)
- [ ] Followed code patterns (CONTRIBUTING.md)
- [ ] No domain engine side effects (if working on domain)
- [ ] User-friendly error handling (if applicable)
- [ ] Framework language only (no personalized advice)
- [ ] TypeScript types properly defined
- [ ] No hardcoded secrets (use environment variables)

---

## 🆘 Troubleshooting

### Git Remote Issues

```bash
# Check current remote (should show: https://github.com/GeorgeMcIntyre-Web/aurora_invest_app.git)
git remote -v

# If wrong or missing, set it:
git remote set-url origin https://github.com/GeorgeMcIntyre-Web/aurora_invest_app.git
# or if it doesn't exist:
git remote add origin https://github.com/GeorgeMcIntyre-Web/aurora_invest_app.git

# Verify
git remote -v
git fetch origin
```

### Can't Find Documentation

All documentation is in the root of `nextjs_space/`:
- `AGENT_INDEX.md` - Start here (navigation index)
- `AGENT_GUIDE.md` - Task instructions and mega prompts
- `AGENT_PROMPTS.md` - Role-specific prompts (this file)
- `ARCHITECTURE.md` - System design and architecture
- `MODULE_BOUNDARIES.md` - Module boundaries and dependencies
- `CONTRIBUTING.md` - Code patterns and conventions
- `GIT_SETUP.md` - Git remote configuration
- `VERIFICATION_CHECKLIST.md` - Documentation verification
- `README.md` - Project overview

### Need Help Understanding Code

1. Read `ARCHITECTURE.md` for system overview
2. Read `MODULE_BOUNDARIES.md` for module structure
3. Check JSDoc comments in `lib/domain/auroraEngine.ts`
4. Review existing similar code in the codebase

---

**Last Updated**: 2024
**Maintained By**: AuroraInvest Team

