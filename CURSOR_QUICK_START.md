# 🚀 CURSOR QUICK START

Ultra-fast prompts for Cursor AI. Just copy the prompt for the task you need.

---

## 🎯 AGENT SELECTION

**Pick your agent based on what you're working on:**

- **Domain Logic** (pure functions, scoring algorithms) → Use Agent 1
- **API Integration** (connect real data sources) → Use Agent 2
- **UI Components** (visual elements, cards, charts) → Use Agent 3
- **Page Logic** (error handling, loading states) → Use Agent 4
- **Testing** (add tests, improve coverage) → Use Agent 5
- **Historical Data** (time-series, charts) → Use Agent 6
- **Portfolio Management** (track holdings, allocations) → Use Agent 7

---

## 📋 ULTRA-SHORT PROMPTS

### 🤖 Agent 1: Add ESG Scoring
```
Agent 1: Add ESG scoring to domain engine

Read CURSOR_MEGA_PROMPTS.md#agent-1 for full constraints.

Task: Add calculateESGScore() function to lib/domain/auroraEngine.ts
- Must be pure function
- Add types to AnalysisTypes.ts
- Add JSDoc comments
- Write tests with real assertions
- Run: npm run build && npm test

Show reality snapshot when done.
```

### 🤖 Agent 2: Connect Alpha Vantage API
```
Agent 2: Integrate Alpha Vantage API

Read CURSOR_MEGA_PROMPTS.md#agent-2 for full constraints.

Task: Add real API integration
- Create lib/services/implementations/AlphaVantageService.ts
- Implement MarketDataService interface
- Add .env.local for API key (don't commit it!)
- Keep demo mode working (no API key = mock data)
- Run: npm run build

Show reality snapshot when done.
```

### 🤖 Agent 3: Add Risk Metrics Card
```
Agent 3: Create risk metrics dashboard card

Read CURSOR_MEGA_PROMPTS.md#agent-3 for full constraints.

Task: Create components/risk-card.tsx
- Show beta, volatility, max drawdown
- Follow existing *-card.tsx patterns
- Use Radix UI + Tailwind
- Responsive design
- Run: npm run build && npm run dev (test it!)

Show reality snapshot when done.
```

### 🤖 Agent 4: Add Analysis Caching
```
Agent 4: Add caching for recent analyses

Read CURSOR_MEGA_PROMPTS.md#agent-4 for full constraints.

Task: Cache recent analysis results in app/page.tsx
- Store last 5 analyses in state
- Check cache before fetching
- User-friendly cache hit message
- Run: npm run build && npm run dev (test it!)

Show reality snapshot when done.
```

### 🤖 Agent 5: Add Service Layer Tests
```
Agent 5: Add tests for service layer

Read CURSOR_MEGA_PROMPTS.md#agent-5 for full constraints.

Task: Create lib/services/__tests__/marketDataService.test.ts
- Test DemoMarketDataService
- Every test needs describe/it/expect
- Use MOCK_STOCK_DATA
- Run: npm test (show FULL output)

Show reality snapshot when done.
```

### 🤖 Agent 6: Add Historical Price Chart
```
Agent 6: Add historical price chart

Read CURSOR_MEGA_PROMPTS.md#agent-6 for full constraints.

Task: Full historical analysis system
- Add types to AnalysisTypes.ts
- Add domain functions (calculateReturns, detectTrend)
- Create components/historical-chart.tsx
- Use recharts library
- Run: npm run build && npm run dev (test it!)

Follow all 10 steps in CURSOR_MEGA_PROMPTS.md#agent-6
Show reality snapshot when done.
```

### 🤖 Agent 7: Add Portfolio Management
```
Agent 7: Add portfolio tracking and management

Read CURSOR_MEGA_PROMPTS.md#agent-7 for full constraints.

Task: Full portfolio management system
- Create lib/domain/portfolioEngine.ts with pure functions
- Create lib/services/portfolioService.ts (localStorage)
- Create components/portfolio-dashboard.tsx
- Create app/portfolio/page.tsx
- Write 15+ tests with real assertions
- Run: npm run build && npm test

CRITICAL: Start from latest main to avoid conflicts!
Follow all 10 steps in CURSOR_MEGA_PROMPTS.md#agent-7
Show reality snapshot when done.
```

---

## ⚡ FASTEST START (3 Steps)

### For ANY Task:

**Step 1:** Copy the relevant agent prompt from CURSOR_MEGA_PROMPTS.md

**Step 2:** Paste into Cursor with your specific task

**Step 3:** Let the agent work, then verify:
```bash
git status -sb
npm run build
npm test
```

---

## 🔥 CRITICAL REMINDERS

**Before starting any task:**
```bash
git status -sb
npm install
npm run build
npm test
```

**After completing any task, provide Reality Snapshot:**
```
## Reality Snapshot
Branch: [git status -sb]
Commit: [git log --oneline -n 1]
Build: [npm run build result]
Tests: [npm test result]
```

**Golden Rules:**
1. ✅ Run real commands, don't make up output
2. ✅ Build must pass before you're done
3. ✅ Tests must have real assertions (no empty files)
4. ✅ Work step-by-step, not all at once
5. ✅ Prove tests actually run with npm test output

---

## 📚 Full Documentation

See **CURSOR_MEGA_PROMPTS.md** for:
- Complete agent prompts with all constraints
- Full implementation steps
- Past failures to avoid
- Non-negotiable rules
- Completion criteria

---

**Last Updated:** 2025-12-03
**Quick Start:** Use this file for fast task assignment
**Deep Dive:** Use CURSOR_MEGA_PROMPTS.md for full details
