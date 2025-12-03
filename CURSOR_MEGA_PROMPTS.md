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

**Last Updated:** 2025-12-03
**Repository:** aurora_invest_app
**For:** Cursor AI online agents
