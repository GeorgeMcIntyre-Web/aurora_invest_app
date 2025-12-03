# 🎯 CURSOR MEGA PROMPTS - Copy & Paste Ready

Quick-start prompts for Cursor AI agents. Each prompt is self-contained and includes all necessary context and constraints.

---

## 📋 TABLE OF CONTENTS

1. [Agent 1: Domain Engine Specialist](#agent-1-domain-engine-specialist)
2. [Agent 2: Service Layer & API Integration](#agent-2-service-layer--api-integration)
3. [Agent 3: UI/UX & Components](#agent-3-uiux--components)
4. [Agent 4: Application Orchestration](#agent-4-application-orchestration)
5. [Agent 5: Testing & Quality](#agent-5-testing--quality)
6. [Agent 6: Historical Analysis & Charts](#agent-6-historical-analysis--charts)
7. [Agent 7: Portfolio Management](#agent-7-portfolio-management)

---

## 🤖 Agent 1: Domain Engine Specialist

**Copy this entire prompt to Cursor:**

```
AGENT 1: Domain Engine Specialist

Your task: Enhance the pure domain analysis engine with new scoring/analysis capabilities.

=== PAST FAILURES & HARD CONSTRAINTS ===
In previous multi-agent runs, the system FAILED in these ways:
1) Storytelling vs Reality - Agents claimed "300+ tests passing" but real commands didn't support it
2) Architecture vs Tests Drift - Docs assumed paths that didn't match actual code locations
3) Fake Progress via Test Scaffolds - Test files existed but Vitest reported "No test suite found"
4) Branch / Commit Confusion - Alternated between "no implementation" and "all complete" without checking
5) Over-Scoped Tasks - Tried too much at once, favoring docs over verifiable builds
6) Premature Tool Blame - Blamed Vitest without minimal reproducible example

=== NON-NEGOTIABLE RULES ===
1) Ground Truth over Narrative
   - Before claiming ANYTHING, run actual commands:
     * git status -sb
     * git branch -a
     * git log --oneline -n 5
     * npm run build
     * npm test
   - Do NOT fabricate CLI output

2) Small, Verifiable Milestones
   - Work in steps with clear "DONE" states:
     * Step A: npm run build passes with 0 errors
     * Step B: Minimal test file runs and passes
     * Step C: Specific test suite passes
   - Do NOT claim "all tests passing" without listing exact commands run

3) Architecture–Test Alignment
   - When moving/creating modules, IMMEDIATELY ensure imports align with actual paths
   - Before finishing: No imports reference non-existent paths

4) Real Tests, Not Scaffolds
   - Every test file MUST contain:
     * At least one describe with at least one it/test block
     * At least one real assertion (expect(...))
   - No empty suites that produce "No test suite found"

5) Tool-Blame Requires Proof
   - Do NOT blame tooling UNTIL you have a minimal test that should obviously pass
   - Assume problem is in config/tests, not in Vitest itself

6) Explicit Reality Snapshots
   - At checkpoints, provide factual snapshot:
     * Current branch
     * Latest commit hash
     * npm run build result
     * Specific test command and result

Your goal: Leave repo where npm run build passes, tests execute and pass, imports are aligned.

=== YOUR CONTEXT ===
Repository: aurora_invest_app (Next.js 14 + TypeScript stock analysis app)
Domain Engine Location: lib/domain/auroraEngine.ts (MUST remain PURE - no side effects)
Types Location: lib/domain/AnalysisTypes.ts
Tests Location: lib/domain/__tests__/

=== CRITICAL CONSTRAINTS ===
1. Domain functions MUST be pure (no API calls, no side effects, deterministic)
2. All new types go in AnalysisTypes.ts
3. Follow existing JSDoc patterns
4. Use framework language only (no "you should buy/sell")
5. No React in domain layer
6. Functions must be testable with known inputs/outputs

=== BEFORE STARTING ===
1. Run reality check:
   git status -sb
   git branch -a
   git log --oneline -n 5

2. Verify build passes:
   npm install
   npm run build

3. Check existing tests:
   npm test

=== YOUR TASK ===
[Choose one or specify custom]:
- Add ESG (Environmental/Social/Governance) scoring
- Enhance valuation classification with PEG ratio analysis
- Add sector comparison capabilities
- Improve fundamentals quality scoring
- Add risk metrics (beta, volatility, max drawdown)
- Custom: [specify]

=== IMPLEMENTATION STEPS ===
1. Read existing code:
   - Read lib/domain/auroraEngine.ts
   - Read lib/domain/AnalysisTypes.ts
   - Understand current patterns

2. Add new types (if needed):
   - Edit lib/domain/AnalysisTypes.ts
   - Add new interfaces/types
   - Run: npm run build (must pass)

3. Implement new function:
   - Edit lib/domain/auroraEngine.ts
   - Add pure function with JSDoc
   - Handle missing data gracefully
   - Run: npm run build (must pass)

4. Write tests:
   - Edit lib/domain/__tests__/auroraEngine.test.ts
   - Add describe block with multiple it blocks
   - Add real assertions
   - Run: npm test

5. Integrate with existing analysis:
   - Update analyzeStock() or related functions
   - Ensure backward compatibility
   - Run: npm run build (must pass)
   - Run: npm test (must pass)

6. Provide reality snapshot:
   ```
   ## Reality Snapshot
   Branch: [git status -sb output]
   Commit: [git log --oneline -n 1 output]
   Build: [npm run build - PASS/FAIL with errors if any]
   Tests: [npm test - X tests passed]
   ```

=== DOCUMENTATION REFERENCES ===
- Architecture: See ARCHITECTURE.md
- Module Boundaries: See MODULE_BOUNDARIES.md
- Coding Standards: See CONTRIBUTING.md

=== COMPLETION CRITERIA ===
- [ ] npm run build passes with 0 TypeScript errors
- [ ] New function added with JSDoc comments
- [ ] New types added to AnalysisTypes.ts (if needed)
- [ ] Tests added with real assertions
- [ ] npm test shows tests passing (actual count)
- [ ] Function integrated into main analysis flow
- [ ] No imports to non-existent modules
- [ ] Reality snapshot provided with actual command outputs

Proceed step-by-step. Provide reality snapshots after each major step.
```

---

## 🤖 Agent 2: Service Layer & API Integration

**Copy this entire prompt to Cursor:**

```
AGENT 2: Service Layer & API Integration

Your task: Integrate real market data APIs while maintaining service layer abstraction.

=== PAST FAILURES & HARD CONSTRAINTS ===
[Same as Agent 1 - see full constraints above]

=== NON-NEGOTIABLE RULES ===
[Same as Agent 1 - see full rules above]

=== YOUR CONTEXT ===
Repository: aurora_invest_app
Service Layer: lib/services/marketDataService.ts
Current Implementation: DemoMarketDataService (uses mock data)
Mock Data: lib/data/mockData.ts

=== CRITICAL CONSTRAINTS ===
1. Must implement MarketDataService interface
2. Must not break existing demo mode
3. Must handle API errors gracefully
4. No API keys in git (use .env.local)
5. Must map API response to StockData type
6. Timeout and retry logic required

=== BEFORE STARTING ===
1. Reality check:
   git status -sb
   npm run build
   npm test

2. Read existing code:
   - Read lib/services/marketDataService.ts
   - Read lib/domain/AnalysisTypes.ts (StockData type)
   - Understand MarketDataService interface

=== YOUR TASK ===
Integrate [choose one]:
- Alpha Vantage API (free tier)
- Finnhub API (generous free tier)
- Yahoo Finance (unofficial API)
- Custom API: [specify]

=== IMPLEMENTATION STEPS ===
1. Create new API service:
   - Create lib/services/implementations/[ApiName]MarketDataService.ts
   - Implement MarketDataService interface
   - Add timeout handling (10 second default)
   - Add retry logic (2 retries with backoff)
   - Map API response to StockData type

2. Add configuration:
   - Create .env.local with API key
   - Update .gitignore to exclude .env.local
   - Create .env.example with placeholder

3. Update service instantiation:
   - Edit lib/services/marketDataService.ts
   - Add conditional: real API if env var present, else demo
   - Preserve demo mode functionality

4. Test with demo mode:
   npm run build (must pass)
   npm test (must pass)
   npm run dev (should work with mock data)

5. Test with real API:
   - Add API key to .env.local
   - Restart dev server
   - Test with real tickers
   - Verify data flows correctly

6. Update documentation:
   - Update README.md with API setup instructions
   - Document environment variables
   - Add troubleshooting section

7. Reality snapshot:
   ```
   ## Reality Snapshot
   Branch: [git status -sb]
   Commit: [git log --oneline -n 1]
   Build: [npm run build result]
   Tests: [npm test result]
   Demo Mode: [tested - yes/no]
   Real API: [tested - yes/no with which tickers]
   ```

=== COMPLETION CRITERIA ===
- [ ] npm run build passes
- [ ] npm test passes
- [ ] Demo mode still works (no API key)
- [ ] Real API works (with API key)
- [ ] Error handling for network/rate limits
- [ ] Timeout protection implemented
- [ ] Retry logic implemented
- [ ] No API keys in git
- [ ] .env.example created
- [ ] README updated with setup instructions

Proceed step-by-step. Test both demo and real API modes.
```

---

## 🤖 Agent 3: UI/UX & Components

**Copy this entire prompt to Cursor:**

```
AGENT 3: UI/UX & Components Specialist

Your task: Create new UI components or enhance existing ones while maintaining design consistency.

=== PAST FAILURES & HARD CONSTRAINTS ===
[Same as Agent 1]

=== NON-NEGOTIABLE RULES ===
[Same as Agent 1]

=== YOUR CONTEXT ===
Repository: aurora_invest_app
UI Framework: Next.js 14 + React 18
Styling: Tailwind CSS + Radix UI
Component Location: components/
Main Dashboard: components/analysis-dashboard.tsx
Existing Cards: components/*-card.tsx

=== CRITICAL CONSTRAINTS ===
1. Follow existing component patterns
2. Use Radix UI for complex UI elements
3. Use Tailwind for styling (no custom CSS)
4. Maintain responsive design (mobile, tablet, desktop)
5. No business logic in components (presentation only)
6. TypeScript props with proper types

=== BEFORE STARTING ===
1. Reality check:
   git status -sb
   npm run build

2. Read existing components:
   - Read components/analysis-dashboard.tsx
   - Read 2-3 existing *-card.tsx components
   - Understand component patterns

=== YOUR TASK ===
[Choose one]:
- Create historical price chart component
- Create portfolio comparison component
- Create risk metrics dashboard card
- Enhance loading states with better animations
- Create export/download functionality
- Custom: [specify]

=== IMPLEMENTATION STEPS ===
1. Plan component structure:
   - Define props interface
   - Identify data requirements
   - Sketch component hierarchy

2. Create component file:
   - Create components/[name].tsx
   - Define TypeScript interface for props
   - Implement component following existing patterns
   - Use Radix UI for complex elements
   - Use Tailwind for styling

3. Test component in isolation:
   npm run build (must pass)

4. Integrate in dashboard:
   - Edit components/analysis-dashboard.tsx or app/page.tsx
   - Add new component
   - Pass required props
   - Test responsive design

5. Manual testing:
   npm run dev
   - Test on desktop view
   - Test on mobile view (browser dev tools)
   - Test with different data scenarios
   - Test error states

6. Reality snapshot:
   ```
   ## Reality Snapshot
   Branch: [git status -sb]
   Commit: [git log --oneline -n 1]
   Build: [npm run build result]
   Dev Server: [tested - yes/no]
   Responsive: [tested on mobile/tablet/desktop]
   Screenshots: [describe what you see or attach if possible]
   ```

=== COMPLETION CRITERIA ===
- [ ] npm run build passes with 0 errors
- [ ] Component follows existing patterns
- [ ] TypeScript props properly typed
- [ ] Responsive on mobile/tablet/desktop
- [ ] Uses Radix UI for complex elements
- [ ] Uses Tailwind for all styling
- [ ] No business logic in component
- [ ] Integrated in main dashboard/page
- [ ] Manually tested in dev server

Proceed step-by-step. Focus on consistency with existing design.
```

---

## 🤖 Agent 4: Application Orchestration

**Copy this entire prompt to Cursor:**

```
AGENT 4: Application Orchestration Specialist

Your task: Enhance app orchestration layer (page.tsx) with better error handling, loading states, and user feedback.

=== PAST FAILURES & HARD CONSTRAINTS ===
[Same as Agent 1]

=== NON-NEGOTIABLE RULES ===
[Same as Agent 1]

=== YOUR CONTEXT ===
Repository: aurora_invest_app
Orchestration Layer: app/page.tsx
Current Features: Basic loading, error handling, and analysis flow

Note: Agent 4 recently added comprehensive loading states and error handling. Build on this work.

=== CRITICAL CONSTRAINTS ===
1. No business logic in page.tsx (call domain engine only)
2. All data fetching through service layer
3. User-friendly error messages (no technical jargon)
4. Loading states for all async operations
5. Graceful error handling with actionable suggestions

=== BEFORE STARTING ===
1. Reality check:
   git status -sb
   git log --oneline -n 5
   npm run build

2. Read current orchestration:
   - Read app/page.tsx (recently enhanced by Agent 4)
   - Understand current error handling
   - Understand loading state system

=== YOUR TASK ===
[Choose one]:
- Add cancellation for long-running analysis
- Add progress indicators during data fetch
- Add retry logic for failed requests
- Add request queuing for multiple analyses
- Add caching for recent analyses
- Custom: [specify]

Note: Loading states and basic error handling already exist. Focus on enhancements.

=== IMPLEMENTATION STEPS ===
1. Review existing code:
   - Read app/page.tsx completely
   - Identify enhancement opportunities
   - Plan new functionality

2. Implement enhancement:
   - Edit app/page.tsx
   - Add new feature following existing patterns
   - Maintain separation of concerns
   - Keep error messages user-friendly

3. Test error scenarios:
   - Test with invalid ticker
   - Test with network timeout (simulate)
   - Test with missing data
   - Verify error messages are helpful

4. Test success scenarios:
   - Test with valid tickers
   - Verify loading states work
   - Verify analysis completes successfully

5. Build and verify:
   npm run build (must pass)
   npm run dev (test manually)

6. Reality snapshot:
   ```
   ## Reality Snapshot
   Branch: [git status -sb]
   Commit: [git log --oneline -n 1]
   Build: [npm run build result]
   Manual Tests:
   - Invalid ticker: [result]
   - Valid ticker (AAPL): [result]
   - Network simulation: [result]
   ```

=== COMPLETION CRITERIA ===
- [ ] npm run build passes
- [ ] No business logic added to page.tsx
- [ ] User-friendly error messages
- [ ] Loading states work correctly
- [ ] Tested with error scenarios
- [ ] Tested with success scenarios
- [ ] No console errors during testing
- [ ] Graceful error handling

Proceed step-by-step. Focus on user experience.
```

---

## 🤖 Agent 5: Testing & Quality

**Copy this entire prompt to Cursor:**

```
AGENT 5: Testing & Quality Specialist

Your task: Add comprehensive tests and improve code quality.

=== PAST FAILURES & HARD CONSTRAINTS ===
In previous multi-agent runs, CRITICAL testing failures occurred:
1) Test Scaffolds Without Content - Files existed but "No test suite found"
2) Tests Without Assertions - describe/it blocks with no expect()
3) Fake Test Counts - Claims of "300+ tests" with no actual execution
4) Tool Blame - "Vitest is broken" without minimal reproducible example

=== NON-NEGOTIABLE RULES ===
1) Ground Truth over Narrative
   - Every test file MUST have describe and it blocks
   - Every test MUST have at least one expect() assertion
   - Run npm test and show ACTUAL output
   - Do NOT claim "X tests passing" without proof

2) Real Tests Only
   - No empty describe blocks
   - No empty it blocks
   - No it blocks without expect()
   - Every test must actually test something

3) Minimal Reproducible Example First
   - If tests fail, create minimal.test.ts with ONE simple test
   - Prove that test should pass
   - Only then investigate tooling

4) Explicit Test Results
   - Show exact npm test output
   - Show number of passing tests (actual count)
   - Show any failures with details

=== YOUR CONTEXT ===
Repository: aurora_invest_app
Test Framework: Vitest 4.0.15
Current Tests: lib/domain/__tests__/auroraEngine.test.ts (8 describe blocks, 234 lines)
Test Command: npm test

Note: Tests may have issues on Windows but should work on Linux/Cursor online environment.

=== CRITICAL CONSTRAINTS ===
1. Every test file must import { describe, it, expect } from 'vitest'
2. Every test must have at least one expect() assertion
3. Test domain functions with known inputs/outputs
4. No test should depend on external APIs
5. Mock data for testing (use MOCK_STOCK_DATA)

=== BEFORE STARTING ===
1. Reality check:
   git status -sb
   npm run build
   npm test (show full output)

2. If npm test fails with "No test suite found":
   - You are likely on Windows
   - Tests should work on Linux/Cursor online
   - Create minimal test to verify Vitest works
   - Document the issue if real

3. Read existing tests:
   - Read lib/domain/__tests__/auroraEngine.test.ts
   - Understand test patterns
   - Understand mock data usage

=== YOUR TASK ===
[Choose one]:
- Add integration tests for full analysis flow
- Add tests for service layer
- Add tests for error handling scenarios
- Add tests for edge cases (missing data, invalid inputs)
- Improve test coverage for existing functions
- Custom: [specify]

=== IMPLEMENTATION STEPS ===
1. Identify what needs testing:
   - Run npm test to see current coverage
   - Identify untested functions
   - List edge cases not covered

2. Write minimal test first:
   - Create or edit test file
   - Add ONE simple test with describe/it/expect
   - Run npm test
   - Verify this test passes

3. Add comprehensive tests:
   - Add multiple describe blocks
   - Add multiple it blocks per describe
   - Each it block has at least one expect()
   - Test success cases
   - Test error cases
   - Test edge cases

4. Verify all tests pass:
   npm test (show full output)

5. Check test quality:
   - No empty describe/it blocks
   - All tests have expect() assertions
   - Tests actually test the function behavior
   - Tests use realistic data

6. Reality snapshot:
   ```
   ## Reality Snapshot
   Branch: [git status -sb]
   Commit: [git log --oneline -n 1]
   Build: [npm run build result]
   Tests: [FULL npm test output]
   Test Count: [X describe blocks, Y it blocks, Z passing]
   ```

=== COMPLETION CRITERIA ===
- [ ] npm run build passes
- [ ] npm test runs successfully
- [ ] All test files have describe/it blocks
- [ ] All it blocks have expect() assertions
- [ ] Tests cover success, error, and edge cases
- [ ] Tests use mock data (no real API calls)
- [ ] Test count matches actual executed tests
- [ ] Full npm test output provided in reality snapshot

WARNING: Do NOT claim tests pass without showing actual npm test output!

Proceed step-by-step. Prove every test actually runs and passes.
```

---

## 🤖 Agent 6: Historical Analysis & Charts

**Copy this entire prompt to Cursor:**

```
AGENT 6: Historical Analysis & Charts Specialist

Your task: Add historical price analysis and time-series charts to the application.

=== PAST FAILURES & HARD CONSTRAINTS ===
[Same as Agent 1]

=== NON-NEGOTIABLE RULES ===
[Same as Agent 1]

=== YOUR CONTEXT ===
Repository: aurora_invest_app
Current Analysis: Snapshot-based (single point in time)
Chart Library: recharts (already in dependencies)
Domain Layer: lib/domain/auroraEngine.ts (must remain pure)

=== CRITICAL CONSTRAINTS ===
1. Domain functions for historical analysis must be pure
2. Historical data fetching goes in service layer
3. Charts are UI components (components/ directory)
4. All new types in AnalysisTypes.ts
5. No side effects in domain functions

=== BEFORE STARTING ===
1. Reality check:
   git status -sb
   npm run build
   npm test

2. Read existing code:
   - Read lib/domain/AnalysisTypes.ts
   - Read lib/services/marketDataService.ts
   - Read components/analysis-dashboard.tsx
   - Understand existing patterns

=== YOUR TASK ===
Add complete historical analysis system:
1. Historical data types
2. Historical domain functions (returns, volatility, trends)
3. Historical data service method
4. Historical chart component
5. Integration in dashboard

=== IMPLEMENTATION STEPS ===

STEP 1: Add Historical Data Types
1. Edit lib/domain/AnalysisTypes.ts
2. Add:
   ```typescript
   export interface HistoricalDataPoint {
     date: string; // ISO date
     price: number;
     volume: number;
   }

   export interface HistoricalData {
     ticker: string;
     period: '1M' | '3M' | '6M' | '1Y' | '5Y';
     dataPoints: HistoricalDataPoint[];
   }
   ```
3. Run: npm run build (must pass)

STEP 2: Add Historical Domain Functions
1. Edit lib/domain/auroraEngine.ts
2. Add pure functions:
   - calculateReturns(data: HistoricalData): { period: number; annualized: number }
   - calculateVolatility(data: HistoricalData): number
   - detectTrend(data: HistoricalData): 'uptrend' | 'downtrend' | 'sideways'
3. Add JSDoc comments
4. Handle missing/empty data
5. Run: npm run build (must pass)

STEP 3: Add Tests
1. Edit lib/domain/__tests__/auroraEngine.test.ts
2. Add describe block for historical functions
3. Add it blocks with expect() assertions
4. Test with mock data
5. Run: npm test

STEP 4: Extend Service Layer
1. Edit lib/services/marketDataService.ts
2. Add to MarketDataService interface:
   ```typescript
   fetchHistoricalData(ticker: string, period: string): Promise<HistoricalData>;
   ```
3. Implement in DemoMarketDataService with mock data
4. Run: npm run build (must pass)

STEP 5: Create Chart Component
1. Create components/historical-chart.tsx
2. Use recharts library (already installed)
3. Props: { data: HistoricalData, height?: number }
4. Add period selector (1M, 3M, 6M, 1Y, 5Y)
5. Responsive design
6. Run: npm run build (must pass)

STEP 6: Create Historical Card
1. Create components/historical-card.tsx
2. Show returns, volatility, trend
3. Follow existing card pattern
4. Run: npm run build (must pass)

STEP 7: Integrate in Dashboard
1. Edit components/analysis-dashboard.tsx
2. Add historical chart and card
3. Run: npm run build (must pass)

STEP 8: Update Page Orchestration
1. Edit app/page.tsx
2. Fetch historical data alongside stock data
3. Pass to dashboard
4. Handle errors
5. Run: npm run build (must pass)

STEP 9: Manual Testing
1. Run: npm run dev
2. Test with different periods
3. Test chart responsiveness
4. Test error handling

STEP 10: Reality Snapshot
```
## Reality Snapshot
Branch: [git status -sb]
Commit: [git log --oneline -n 1]
Build: [npm run build result]
Tests: [npm test result]
Manual Tests: [describe what works]
```

=== COMPLETION CRITERIA ===
- [ ] npm run build passes with 0 errors
- [ ] All new types in AnalysisTypes.ts
- [ ] All domain functions are pure
- [ ] Tests added with real assertions
- [ ] npm test shows tests passing
- [ ] Service layer method implemented
- [ ] Chart component created
- [ ] Historical card created
- [ ] Integrated in dashboard
- [ ] Manually tested in dev server
- [ ] Responsive on mobile/tablet/desktop

Proceed step-by-step through all 10 steps. Provide reality snapshot at end.
```

---

## 📚 QUICK REFERENCE

### Always Start With:
```bash
git status -sb
git log --oneline -n 3
npm install
npm run build
npm test
```

### Always End With Reality Snapshot:
```
## Reality Snapshot
Branch: [git status -sb output]
Commit: [git log --oneline -n 1 output]
Build: [npm run build - PASS or FAIL with errors]
Tests: [npm test - full output or "N tests passed"]
```

### Documentation Files to Reference:
- **ARCHITECTURE.md** - System design and data flows
- **MODULE_BOUNDARIES.md** - Where code should live
- **CONTRIBUTING.md** - Coding standards and patterns
- **TESTING_NOTE.md** - Current test status and known issues

### Critical Rules for ALL Agents:
1. ✅ Ground truth over narrative (run real commands)
2. ✅ Small verifiable milestones (step by step)
3. ✅ Real tests with assertions (no empty scaffolds)
4. ✅ Build must pass before claiming done
5. ✅ Provide actual command output (no fabrication)

---

---

## 🤖 Agent 7: Portfolio Management

**Copy this entire prompt to Cursor:**

```
AGENT 7: Portfolio Management

Your task: Add portfolio tracking and management functionality to Aurora Invest App.

=== PAST FAILURES & HARD CONSTRAINTS ===
In previous multi-agent runs, the system FAILED in these ways:
1) Storytelling vs Reality - Agents claimed "300+ tests passing" but real commands didn't support it
2) Architecture vs Tests Drift - Docs assumed paths that didn't match actual code locations
3) Fake Progress via Test Scaffolds - Test files existed but Vitest reported "No test suite found"
4) Branch / Commit Confusion - Alternated between "no implementation" and "all complete" without checking
5) Over-Scoped Tasks - Tried too much at once, favoring docs over verifiable builds
6) Premature Tool Blame - Blamed Vitest without minimal reproducible example
7) MERGE CONFLICTS - Agent 6 initially created conflicts by not rebasing on latest main

=== NON-NEGOTIABLE RULES ===
1) Ground Truth over Narrative
   - Before claiming ANYTHING, run actual commands:
     * git status -sb
     * git branch -a
     * git log --oneline -n 5
     * npm run build
     * npm test
   - Do NOT fabricate CLI output

2) Small, Verifiable Milestones
   - Work in steps with clear "DONE" states:
     * Step A: npm run build passes with 0 errors
     * Step B: Minimal test file runs and passes
     * Step C: Specific test suite passes
   - Do NOT claim "all tests passing" without listing exact commands run

3) NO CONFLICTS Strategy
   - ALWAYS start by creating branch from latest main:
     * git checkout main
     * git pull origin main
     * git checkout -b feature/agent7-portfolio-management
   - Do NOT branch from outdated commits

4) Real Tests, Not Scaffolds
   - Every test file MUST contain:
     * At least one describe with at least one it/test block
     * At least one real assertion (expect(...))
   - No empty suites that produce "No test suite found"

5) Explicit Reality Snapshots
   - At checkpoints, provide factual snapshot:
     * Current branch
     * Latest commit hash
     * npm run build result
     * Specific test command and result

Your goal: Leave repo where npm run build passes, tests execute and pass, NO MERGE CONFLICTS.

=== YOUR CONTEXT ===
Repository: aurora_invest_app (Next.js 14 + TypeScript stock analysis app)
Current main commit: 71dee07 (all 6 agents merged + documentation)

Stack:
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS + Radix UI
- Vitest for testing
- localStorage for data persistence (Phase 1)

=== YOUR TASK: Portfolio Management ===

Create a portfolio tracking system that allows users to:
1. Add/remove stock holdings (ticker, shares, cost basis, purchase date)
2. View portfolio dashboard (total value, daily change, allocation)
3. See portfolio metrics (beta, volatility, concentration risk)
4. Analyze stocks in portfolio context (suggested actions: buy/hold/sell)

=== IMPLEMENTATION STEPS ===

STEP 1: Create Branch from Latest Main (CRITICAL!)
```bash
git checkout main
git pull origin main
git log --oneline -n 1  # Verify you're at 71dee07 or later
git checkout -b feature/agent7-portfolio-management
git status -sb
```

STEP 2: Domain Layer - Portfolio Types & Pure Functions
File: lib/domain/portfolioEngine.ts (NEW)

```typescript
/**
 * Portfolio Management Domain Logic
 * Pure functions for portfolio calculations and analysis
 */

export interface PortfolioHolding {
  ticker: string;
  shares: number;
  averageCostBasis: number;
  purchaseDate: string; // ISO date string
}

export interface Portfolio {
  id: string;
  name: string;
  holdings: PortfolioHolding[];
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioMetrics {
  totalValue: number;
  totalCost: number;
  totalGainLoss: number;
  totalGainLossPct: number;
  beta: number;
  volatility: number;
}

export interface PortfolioAllocation {
  ticker: string;
  value: number;
  weightPct: number;
  gainLoss: number;
  gainLossPct: number;
}

export interface ConcentrationRisk {
  level: 'low' | 'moderate' | 'high';
  warnings: string[];
  largestPositions: { ticker: string; weightPct: number }[];
}

/**
 * Calculate portfolio-wide metrics
 * @param portfolio - The portfolio to analyze
 * @param currentPrices - Map of ticker to current price
 * @returns Portfolio metrics including value, gain/loss, beta, volatility
 */
export function calculatePortfolioMetrics(
  portfolio: Portfolio,
  currentPrices: Map<string, number>,
  stockBetas?: Map<string, number>
): PortfolioMetrics {
  // Implementation: calculate total value, cost, gain/loss, weighted beta
  // Pure function - no side effects
}

/**
 * Calculate position allocations and weights
 * @param portfolio - The portfolio to analyze
 * @param currentPrices - Map of ticker to current price
 * @returns Array of allocations with weights
 */
export function calculateAllocation(
  portfolio: Portfolio,
  currentPrices: Map<string, number>
): PortfolioAllocation[] {
  // Implementation: calculate each position's value and weight
  // Pure function - no side effects
}

/**
 * Detect concentration risk in portfolio
 * @param allocations - Portfolio allocations
 * @returns Concentration risk assessment
 */
export function detectConcentrationRisk(
  allocations: PortfolioAllocation[]
): ConcentrationRisk {
  // Implementation:
  // - Flag positions > 25% (high risk)
  // - Flag positions > 15% (moderate risk)
  // - Return top 3 largest positions
  // Pure function - no side effects
}

/**
 * Suggest action for stock in portfolio context
 * @param ticker - Stock ticker
 * @param portfolio - Current portfolio
 * @param currentWeight - Current weight of this stock in portfolio
 * @returns Suggested action with reasoning
 */
export function suggestPortfolioAction(
  ticker: string,
  portfolio: Portfolio,
  currentWeight: number
): { action: 'buy' | 'hold' | 'sell' | 'trim'; reasoning: string[] } {
  // Implementation: based on position size and concentration
  // Pure function - no side effects
}
```

After creating: Run `npm run build` and fix any TypeScript errors.

STEP 3: Service Layer - Portfolio Persistence
File: lib/services/portfolioService.ts (NEW)

```typescript
import { Portfolio, PortfolioHolding } from '../domain/portfolioEngine';

export interface PortfolioService {
  getPortfolio(id: string): Promise<Portfolio | null>;
  savePortfolio(portfolio: Portfolio): Promise<void>;
  getAllPortfolios(): Promise<Portfolio[]>;
  deletePortfolio(id: string): Promise<void>;
}

/**
 * localStorage-based portfolio service
 * Stores portfolios in browser localStorage
 */
export class LocalStoragePortfolioService implements PortfolioService {
  private readonly STORAGE_KEY = 'aurora_portfolios';

  async getPortfolio(id: string): Promise<Portfolio | null> {
    const portfolios = this.loadPortfolios();
    return portfolios.find((p) => p.id === id) || null;
  }

  async savePortfolio(portfolio: Portfolio): Promise<void> {
    const portfolios = this.loadPortfolios();
    const index = portfolios.findIndex((p) => p.id === portfolio.id);

    if (index >= 0) {
      portfolios[index] = { ...portfolio, updatedAt: new Date().toISOString() };
    } else {
      portfolios.push(portfolio);
    }

    this.storePortfolios(portfolios);
  }

  async getAllPortfolios(): Promise<Portfolio[]> {
    return this.loadPortfolios();
  }

  async deletePortfolio(id: string): Promise<void> {
    const portfolios = this.loadPortfolios();
    const filtered = portfolios.filter((p) => p.id !== id);
    this.storePortfolios(filtered);
  }

  private loadPortfolios(): Portfolio[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  private storePortfolios(portfolios: Portfolio[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(portfolios));
  }
}

// Export singleton instance
export const portfolioService = new LocalStoragePortfolioService();
```

After creating: Run `npm run build` and fix any TypeScript errors.

STEP 4: UI Components - Portfolio Dashboard
File: components/portfolio-dashboard.tsx (NEW)

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import {
  Portfolio,
  PortfolioMetrics,
  PortfolioAllocation,
  calculatePortfolioMetrics,
  calculateAllocation,
  detectConcentrationRisk
} from '@/lib/domain/portfolioEngine';
import { portfolioService } from '@/lib/services/portfolioService';

export function PortfolioDashboard() {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [metrics, setMetrics] = useState<PortfolioMetrics | null>(null);
  const [allocations, setAllocations] = useState<PortfolioAllocation[]>([]);

  // Implementation:
  // - Load portfolio from localStorage
  // - Fetch current prices for all holdings
  // - Calculate metrics and allocations
  // - Display in cards

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Overview</CardTitle>
          <CardDescription>Your holdings and performance</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Display portfolio value, daily change, total gain/loss */}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Holdings</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Table of holdings with add/remove actions */}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Risk Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Display beta, volatility, concentration warnings */}
        </CardContent>
      </Card>
    </div>
  );
}
```

After creating: Run `npm run build` and fix any TypeScript/React errors.

STEP 5: New Page - Portfolio Route
File: app/portfolio/page.tsx (NEW)

```typescript
import { PortfolioDashboard } from '@/components/portfolio-dashboard';

export default function PortfolioPage() {
  return (
    <main className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">My Portfolio</h1>
      <PortfolioDashboard />
    </main>
  );
}
```

After creating: Run `npm run build` and verify route is accessible.

STEP 6: Integration - Add Portfolio Context to Stock Analysis
File: components/analysis-dashboard.tsx (UPDATE)

Add portfolio context section that shows:
- If stock is already held in portfolio
- Current position size and gain/loss
- Suggested action (buy more, hold, trim)

STEP 7: Tests - Domain Layer
File: lib/domain/__tests__/portfolioEngine.test.ts (NEW)

```typescript
import { describe, expect, it } from 'vitest';
import {
  calculatePortfolioMetrics,
  calculateAllocation,
  detectConcentrationRisk,
  suggestPortfolioAction,
  Portfolio,
  PortfolioHolding,
} from '../portfolioEngine';

const createPortfolio = (holdings: PortfolioHolding[]): Portfolio => ({
  id: 'test-portfolio',
  name: 'Test Portfolio',
  holdings,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
});

describe('calculatePortfolioMetrics', () => {
  it('calculates total value and gain/loss correctly', () => {
    const portfolio = createPortfolio([
      { ticker: 'AAPL', shares: 10, averageCostBasis: 150, purchaseDate: '2024-01-01' },
      { ticker: 'MSFT', shares: 5, averageCostBasis: 300, purchaseDate: '2024-01-01' },
    ]);

    const currentPrices = new Map([
      ['AAPL', 180],  // +$300 gain
      ['MSFT', 350],  // +$250 gain
    ]);

    const metrics = calculatePortfolioMetrics(portfolio, currentPrices);

    expect(metrics.totalValue).toBe(3550);  // 10*180 + 5*350
    expect(metrics.totalCost).toBe(3000);   // 10*150 + 5*300
    expect(metrics.totalGainLoss).toBe(550);
    expect(metrics.totalGainLossPct).toBeCloseTo(18.33, 1);
  });

  it('handles empty portfolio gracefully', () => {
    const portfolio = createPortfolio([]);
    const metrics = calculatePortfolioMetrics(portfolio, new Map());

    expect(metrics.totalValue).toBe(0);
    expect(metrics.totalCost).toBe(0);
    expect(metrics.totalGainLoss).toBe(0);
  });
});

describe('calculateAllocation', () => {
  it('computes position weights correctly', () => {
    const portfolio = createPortfolio([
      { ticker: 'AAPL', shares: 10, averageCostBasis: 150, purchaseDate: '2024-01-01' },
      { ticker: 'MSFT', shares: 5, averageCostBasis: 300, purchaseDate: '2024-01-01' },
    ]);

    const currentPrices = new Map([
      ['AAPL', 180],
      ['MSFT', 360],
    ]);

    const allocations = calculateAllocation(portfolio, currentPrices);

    expect(allocations).toHaveLength(2);
    expect(allocations[0].ticker).toBe('AAPL');
    expect(allocations[0].value).toBe(1800);
    expect(allocations[0].weightPct).toBeCloseTo(50, 1);  // 1800 / 3600
  });

  it('sums to 100% allocation', () => {
    const portfolio = createPortfolio([
      { ticker: 'AAPL', shares: 10, averageCostBasis: 150, purchaseDate: '2024-01-01' },
      { ticker: 'MSFT', shares: 5, averageCostBasis: 300, purchaseDate: '2024-01-01' },
      { ticker: 'GOOGL', shares: 8, averageCostBasis: 120, purchaseDate: '2024-01-01' },
    ]);

    const currentPrices = new Map([
      ['AAPL', 180],
      ['MSFT', 360],
      ['GOOGL', 140],
    ]);

    const allocations = calculateAllocation(portfolio, currentPrices);
    const totalWeight = allocations.reduce((sum, a) => sum + a.weightPct, 0);

    expect(totalWeight).toBeCloseTo(100, 1);
  });
});

describe('detectConcentrationRisk', () => {
  it('flags single positions over 25% as high risk', () => {
    const allocations = [
      { ticker: 'AAPL', value: 3000, weightPct: 60, gainLoss: 500, gainLossPct: 20 },
      { ticker: 'MSFT', value: 2000, weightPct: 40, gainLoss: 200, gainLossPct: 11 },
    ];

    const risk = detectConcentrationRisk(allocations);

    expect(risk.level).toBe('high');
    expect(risk.warnings.some(w => w.includes('AAPL'))).toBe(true);
  });

  it('returns low risk for well-diversified portfolio', () => {
    const allocations = [
      { ticker: 'AAPL', value: 1000, weightPct: 20, gainLoss: 100, gainLossPct: 11 },
      { ticker: 'MSFT', value: 1000, weightPct: 20, gainLoss: 100, gainLossPct: 11 },
      { ticker: 'GOOGL', value: 1000, weightPct: 20, gainLoss: 100, gainLossPct: 11 },
      { ticker: 'TSLA', value: 1000, weightPct: 20, gainLoss: 100, gainLossPct: 11 },
      { ticker: 'NVDA', value: 1000, weightPct: 20, gainLoss: 100, gainLossPct: 11 },
    ];

    const risk = detectConcentrationRisk(allocations);

    expect(risk.level).toBe('low');
    expect(risk.warnings).toHaveLength(0);
  });
});

describe('suggestPortfolioAction', () => {
  it('suggests trim for oversized positions', () => {
    const portfolio = createPortfolio([
      { ticker: 'AAPL', shares: 100, averageCostBasis: 150, purchaseDate: '2024-01-01' },
    ]);

    const result = suggestPortfolioAction('AAPL', portfolio, 35);

    expect(result.action).toBe('trim');
    expect(result.reasoning.some(r => r.includes('concentrated'))).toBe(true);
  });

  it('suggests hold for appropriately sized positions', () => {
    const portfolio = createPortfolio([
      { ticker: 'AAPL', shares: 10, averageCostBasis: 150, purchaseDate: '2024-01-01' },
      { ticker: 'MSFT', shares: 10, averageCostBasis: 300, purchaseDate: '2024-01-01' },
    ]);

    const result = suggestPortfolioAction('AAPL', portfolio, 18);

    expect(result.action).toBe('hold');
  });
});
```

CRITICAL: After writing tests, run `npm test` and verify ALL tests pass.

STEP 8: Tests - Service Layer
File: lib/services/__tests__/portfolioService.test.ts (NEW)

```typescript
import { describe, expect, it, beforeEach } from 'vitest';
import { LocalStoragePortfolioService } from '../portfolioService';
import { Portfolio } from '../../domain/portfolioEngine';

// Mock localStorage for Node environment
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

global.localStorage = localStorageMock as any;

describe('LocalStoragePortfolioService', () => {
  let service: LocalStoragePortfolioService;

  beforeEach(() => {
    localStorageMock.clear();
    service = new LocalStoragePortfolioService();
  });

  it('saves and retrieves portfolios', async () => {
    const portfolio: Portfolio = {
      id: 'test-1',
      name: 'My Portfolio',
      holdings: [
        { ticker: 'AAPL', shares: 10, averageCostBasis: 150, purchaseDate: '2024-01-01' },
      ],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    };

    await service.savePortfolio(portfolio);
    const retrieved = await service.getPortfolio('test-1');

    expect(retrieved).not.toBeNull();
    expect(retrieved?.id).toBe('test-1');
    expect(retrieved?.holdings).toHaveLength(1);
  });

  it('returns null for non-existent portfolio', async () => {
    const result = await service.getPortfolio('non-existent');
    expect(result).toBeNull();
  });

  it('deletes portfolios', async () => {
    const portfolio: Portfolio = {
      id: 'test-2',
      name: 'Delete Me',
      holdings: [],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    };

    await service.savePortfolio(portfolio);
    await service.deletePortfolio('test-2');

    const retrieved = await service.getPortfolio('test-2');
    expect(retrieved).toBeNull();
  });

  it('lists all portfolios', async () => {
    const p1: Portfolio = {
      id: 'test-3',
      name: 'Portfolio 1',
      holdings: [],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    };

    const p2: Portfolio = {
      id: 'test-4',
      name: 'Portfolio 2',
      holdings: [],
      createdAt: '2024-01-02',
      updatedAt: '2024-01-02',
    };

    await service.savePortfolio(p1);
    await service.savePortfolio(p2);

    const all = await service.getAllPortfolios();
    expect(all).toHaveLength(2);
  });
});
```

CRITICAL: After writing tests, run `npm test` and verify ALL tests pass.

STEP 9: Build & Test Verification
```bash
# Build must pass with 0 errors
npm run build

# All tests must pass
npm test

# Check git status
git status -sb
```

STEP 10: Commit & Push
```bash
git add .
git commit -m "feat: add portfolio management system

- Create portfolioEngine.ts with pure domain functions
- Add LocalStoragePortfolioService for persistence
- Create portfolio dashboard UI components
- Add /portfolio route
- Integrate portfolio context into stock analysis
- Add 15+ comprehensive tests (domain + service)
- Build passes with 0 TypeScript errors
- All tests passing

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

git push origin feature/agent7-portfolio-management
```

=== COMPLETION CRITERIA ===
✅ Branch created from latest main (71dee07 or later)
✅ All new files created:
   - lib/domain/portfolioEngine.ts
   - lib/services/portfolioService.ts
   - lib/domain/__tests__/portfolioEngine.test.ts
   - lib/services/__tests__/portfolioService.test.ts
   - components/portfolio-dashboard.tsx
   - app/portfolio/page.tsx
✅ npm run build passes with 0 TypeScript errors
✅ npm test passes with 15+ tests (domain + service)
✅ All tests have real describe/it/expect blocks (no scaffolds)
✅ Code committed and pushed to feature branch
✅ NO MERGE CONFLICTS (verified by starting from latest main)

=== REALITY SNAPSHOT TEMPLATE ===
When complete, provide:

```
## Agent 7 Reality Snapshot

**Branch:**
[output of: git status -sb]

**Latest Commit:**
[output of: git log --oneline -n 1]

**Build Status:**
[output of: npm run build]

**Test Status:**
[output of: npm test]

**Files Created:**
- lib/domain/portfolioEngine.ts (XXX lines)
- lib/services/portfolioService.ts (XXX lines)
- lib/domain/__tests__/portfolioEngine.test.ts (XXX lines)
- lib/services/__tests__/portfolioService.test.ts (XXX lines)
- components/portfolio-dashboard.tsx (XXX lines)
- app/portfolio/page.tsx (XXX lines)

**Test Summary:**
XX tests passing across 2 test files
- Domain tests: XX passing
- Service tests: XX passing

**Verification:**
✅ Build: PASSING
✅ Tests: PASSING
✅ TypeScript: 0 errors
✅ Branch pushed to origin
✅ NO MERGE CONFLICTS

Ready for PR creation.
```

=== CRITICAL REMINDERS ===
1. ✅ ALWAYS start from latest main to avoid conflicts
2. ✅ Run npm run build after each major change
3. ✅ Write real tests with actual expect() assertions
4. ✅ Provide actual command output (no fabrication)
5. ✅ Commit frequently with descriptive messages
6. ✅ Portfolio functions MUST be pure (domain layer)
7. ✅ Service layer handles persistence (localStorage)
8. ✅ UI components use 'use client' directive
9. ✅ Follow existing code patterns and styles
10. ✅ Test on both domain and service layers

Good luck, Agent 7! Build something amazing! 🚀
```

---

**Last Updated:** 2025-12-03
**Repository:** aurora_invest_app
**For:** Cursor AI online agents
