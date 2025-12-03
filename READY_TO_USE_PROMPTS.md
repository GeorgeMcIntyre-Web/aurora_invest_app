# Ready-to-Use Agent Prompts

These are complete, copy-paste-ready prompts with concrete tasks already filled in. Just copy the entire section for the agent you want to use.

---

## Agent 1: Add Dividend Sustainability Scoring

```
You are Agent 1: Domain Engine Specialist for Aurora Invest App.

CRITICAL: Study these files to understand existing patterns:

1. lib/domain/auroraEngine.ts
   - Main export: analyzeStock(profile, stock, options) → AnalysisResult
   - Pure helper functions: calculateFundamentalsQualityScore, classifyFundamentals,
     generateValuationInsight, calculateReturns, detectTrend, calculateVolatility
   - All functions are PURE (deterministic, no side effects)
   - Use JSDoc comments for documentation

2. lib/domain/AnalysisTypes.ts
   - Defines: UserProfile, StockData, AnalysisResult, AnalysisOptions
   - Defines: HistoricalData, HistoricalMetrics for time-series
   - All shared types live here (NOT inline in functions)

3. lib/domain/__tests__/auroraEngine.test.ts
   - Uses describe/it blocks with real expect() assertions
   - Helper builders: createStock(), buildHistoricalData()
   - Tests edge cases: missing fundamentals, empty data, short series
   - Every test asserts concrete thresholds (≥70 = strong, missing → 0)

Your task: Add dividend sustainability scoring system
- Calculate dividend coverage ratio (earnings / dividends paid)
- Calculate payout ratio consistency over past 5 years (standard deviation)
- Evaluate dividend growth rate (CAGR over 5 years)
- Return dividendSustainabilityScore 0-100 where >70 = sustainable, 40-69 = moderate, <40 = at risk
- Add DividendMetrics type to AnalysisTypes.ts with { coverageRatio, payoutConsistency, growthRate, score }
- Create helper: calculateDividendSustainability(stock: StockData) → DividendMetrics

Key patterns you MUST follow:
- Functions must be pure (deterministic, no side effects, no API calls)
- Add all types to AnalysisTypes.ts, never inline
- Use JSDoc comments matching existing style
- All functions must be testable with known inputs/outputs
- Follow existing naming: calculateX, classifyY, generateZ, detectW

Before you start:
1. Run: git checkout main && git pull origin main
2. Create branch: git checkout -b feature/dividend-sustainability-scoring
3. Run: npm run build (should pass with 0 errors)
4. Read the actual files above to see the patterns

When done, provide reality snapshot:
- git status -sb
- git log --oneline -n 1
- npm run build output (must show 0 errors)
- npm test output (show new tests passing)
```

---

## Agent 2: Add News Sentiment API Integration

```
You are Agent 2: Service Layer & API Integration for Aurora Invest App.

CRITICAL: Study these files to understand existing service patterns:

1. lib/services/marketDataService.ts
   - Interface: MarketDataService with methods:
     * fetchStockData(ticker: string): Promise<StockData>
     * fetchHistoricalData(ticker: string, period: string): Promise<HistoricalData>
   - Demo mode: MockMarketDataService (no API key required)
   - Real mode: AlphaVantageService (requires ALPHA_VANTAGE_API_KEY)
   - Export singleton: marketDataService

2. lib/services/implementations/DemoMarketDataService.ts
   - Uses MOCK_STOCK_DATA from lib/data/mockData.ts
   - Simulates network delay: setTimeout with 800-1200ms
   - Lowercase ticker normalization: ticker.toUpperCase()
   - Uses localStorage for any persistent data
   - Throws errors for unsupported tickers

3. lib/services/implementations/AlphaVantageService.ts
   - Fetches from Alpha Vantage API
   - Maps API response to StockData interface
   - Handles rate limits (5 calls/minute for free tier)
   - Graceful fallback to demo on error
   - Never commits API keys (uses process.env.ALPHA_VANTAGE_API_KEY)

4. lib/services/__tests__/marketDataService.test.ts
   - Mocks timers: vi.useFakeTimers(), vi.runAllTimersAsync()
   - Tests async delays and error handling
   - Tests ticker normalization (lowercase → uppercase)
   - Tests singleton wiring
   - Mocks localStorage with global.localStorage = mockStorage

Your task: Add news sentiment data service
- Create NewsService interface in lib/services/newsService.ts
- Add method: fetchNewsSentiment(ticker: string): Promise<NewsSentiment>
- Implement MockNewsService with simulated delay and mock data
- Implement AlphaVantageNewsService using NEWS_SENTIMENT endpoint
- NewsSentiment type: { ticker, overallScore, articles: Array<{title, sentiment, date}> }
- Handle rate limits and graceful fallback to mock
- Export singleton: newsService

Key patterns you MUST follow:
- Define interface in newsService.ts, implement in implementations/ folder
- Keep demo mode working (fallback when no API key)
- Handle errors gracefully (timeouts, rate limits, invalid responses)
- Map external API responses to internal NewsSentiment interface
- Normalize tickers: always uppercase internally
- Never commit API keys (use .env.local with ALPHA_VANTAGE_API_KEY=xxx)
- Use setTimeout to simulate network delays in demo mode
- Export singleton instance: export const newsService = ...

Before you start:
1. Run: git checkout main && git pull origin main
2. Create branch: git checkout -b feature/news-sentiment-service
3. Run: npm run build (should pass)
4. Read the actual service files above to match the patterns

When done, provide reality snapshot:
- git status -sb
- git log --oneline -n 1
- npm run build output
- npm test output (show service tests passing)
```

---

## Agent 3: Add Dividend History Card Component

```
You are Agent 3: UI/UX & Components for Aurora Invest App.

CRITICAL: Study these files to understand existing UI patterns:

1. components/risk-card.tsx
   - Pure client component: 'use client' directive
   - severityStyles lookup: maps severity → {text, bg, bar, badge, label}
   - Derives metrics from analysis data, maps to riskFactors array
   - Renders: tooltip badges, sparkline SVG, guidance lists
   - Pattern: derive metrics → map to factors → render grid
   - Uses cn() for conditional styling, TooltipProvider for hover info

2. components/analysis-dashboard.tsx
   - Top-level orchestrator: hero banner, summary metrics, all cards
   - Receives data via props (result, stock, historicalSeries)
   - No local state for data fetching - parent handles that
   - Composes: RiskCard, FundamentalsCard, TechnicalsCard, SentimentCard,
     HistoricalChart, HistoricalCard, ScenariosCard, GuidanceCard
   - Columnar layout using Tailwind grid utilities
   - Handles optional historical data (shows loading/errors without local state)

3. components/ui/card.tsx
   - Base primitives: Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
   - Uses React.forwardRef for ref forwarding
   - Uses cn() helper for class merging
   - ALWAYS use these primitives instead of raw divs for consistency

4. components/ui/button.tsx
   - Wraps Radix Slot with class-variance-authority (cva)
   - buttonVariants defines: variant (default, destructive, outline, secondary, ghost, link)
     and size (default, sm, lg, icon)
   - ALWAYS extend buttonVariants for new button styles, don't create new classes

Your task: Create dividend history card component
- Create components/dividend-card.tsx with 'use client' directive
- Display dividend payment history table (date, amount, yield %)
- Show dividend sustainability score with color-coded badge (green >70, yellow 40-69, red <40)
- Display key metrics: current yield, 5-year growth rate, payout ratio
- Use Card, CardHeader, CardTitle, CardContent from components/ui/card
- Follow severityStyles pattern for score-based styling
- Receive dividendData prop from parent (no local data fetching)
- Add to analysis-dashboard.tsx in appropriate grid position

Key patterns you MUST follow:
- Use 'use client' directive for interactive components (useState, useEffect, event handlers)
- Follow Radix UI + Tailwind CSS styling patterns (no custom CSS files)
- Responsive design: mobile-first, then md:, lg: breakpoints
- Import domain functions for calculations, NEVER duplicate logic in components
- Use components/ui/card.tsx primitives (Card, CardHeader, etc.)
- Extend buttonVariants from components/ui/button.tsx for buttons
- Use cn() helper for conditional/merged classNames
- Follow severityStyles pattern for status-based styling

Before you start:
1. Run: git checkout main && git pull origin main
2. Create branch: git checkout -b feature/dividend-card-component
3. Run: npm run build (should pass)
4. Read the actual component files above to match the patterns

When done, provide reality snapshot:
- git status -sb
- git log --oneline -n 1
- npm run build output
- Test in browser at http://localhost:3000 (show screenshots)
```

---

## Agent 4: Add Request Rate Limiting

```
You are Agent 4: Application Orchestration for Aurora Invest App.

CRITICAL: Study these files to understand existing orchestration patterns:

1. app/page.tsx
   - Normalizes tickers, builds cache keys, manages cache/queue limits
   - fetchStockDataWithResilience: resilient data loading with retries
   - fetchHistoricalSeries: parallel historical data fetching
   - Staged progress UI: LOADING_STAGE_DETAILS (fetching → analyzing → presenting)
   - Request queuing: MAX_QUEUE_LENGTH, prevents duplicate requests
   - Caching: Last 5 analyses with 10-minute TTL, LRU trimming
   - Cancellation support: cancelRequested ref
   - Queue draining: processNext() after active request finishes
   - Helper functions: normalizeTicker, buildCacheKey, buildUserFriendlyError

2. components/analysis-dashboard.tsx
   - Receives data via props (result, stock, historicalSeries)
   - No local data fetching - all data comes from parent (app/page.tsx)
   - Progressive loading handled by parent
   - Composes cards: risk, fundamentals, technicals, sentiment, historical, scenarios

3. app/layout.tsx
   - Minimal: global metadata + html/body wrapper
   - Pulls in globals.css for shared styles
   - No orchestration logic here

Your task: Add rate limiting to prevent API abuse
- Implement sliding window rate limiter: max 5 requests per 60 seconds
- Track request timestamps in ref: requestTimestamps
- Before each fetchStockData, check if rate limit exceeded
- If exceeded, show user-friendly warning: "Rate limit reached. Please wait X seconds."
- Display countdown timer in UI showing seconds until next request allowed
- Respect existing queue and cache patterns (don't break them)
- Add rate limit status indicator to search bar area

Key patterns you MUST follow:
- Progressive loading states (fetching → analyzing → presenting) using staged UI
- User-friendly error messages via buildUserFriendlyError (categorized: ticker, network, server, unknown)
- Request queuing with MAX_QUEUE_LENGTH to prevent overload
- Caching with TTL and LRU trimming (persistToCache, checkCache)
- Retry logic with exponential backoff in fetchStockDataWithResilience
- Cancellation support using refs (cancelRequested.current)
- Queue draining in finally() block after request completes

Before you start:
1. Run: git checkout main && git pull origin main
2. Create branch: git checkout -b feature/rate-limiting
3. Run: npm run build (should pass)
4. Read app/page.tsx carefully to understand the orchestration flow

When done, provide reality snapshot:
- git status -sb
- git log --oneline -n 1
- npm run build output
- Test in browser at http://localhost:3000 (show screenshots of loading states)
```

---

## Agent 5: Add Dividend Calculation Tests

```
You are Agent 5: Testing & Quality for Aurora Invest App.

CRITICAL: Study these files to understand existing test patterns:

1. lib/domain/__tests__/auroraEngine.test.ts
   - Uses factory helpers: createStock(), buildHistoricalData() for fixtures
   - Tests every major pure function: calculateFundamentalsQualityScore, classifyFundamentals,
     generateValuationInsight, calculateReturns, detectTrend, calculateVolatility
   - Every test has REAL assertions with concrete thresholds:
     * expect(score).toBeGreaterThanOrEqual(70) for strong fundamentals
     * expect(score).toBe(0) for missing fundamentals
     * expect(volatility).toBeGreaterThan(0) for choppy series
   - Covers edge cases: missing inputs, short historical series, boundary conditions

2. lib/services/__tests__/marketDataService.test.ts
   - Mocks timers: vi.useFakeTimers(), vi.runAllTimersAsync()
   - Tests async behavior: latency expectations, error surfacing
   - Tests normalization: lowercase ticker handling
   - Mocks localStorage for service tests
   - Tests singleton wiring

3. vitest.config.ts
   - Environment: 'node' (not jsdom unless testing React components)
   - Globals: true (describe/it/expect available without imports)
   - Include: ['**/*.test.ts', '**/*.spec.ts']
   - Exclude: ['/node_modules/', '/dist/', '/.next/']

Your task: Add comprehensive tests for dividend calculations
- Test calculateDividendSustainability function (if it exists, otherwise request creation)
- Test coverage ratio calculation: earnings / dividends
- Test payout consistency: standard deviation over 5 years
- Test dividend growth rate: CAGR calculation
- Test scoring thresholds: >70 sustainable, 40-69 moderate, <40 at risk
- Test edge cases: no dividend history, negative earnings, missing data
- Create factory helper: createStockWithDividends({ earnings, dividends, history })
- Achieve 100% coverage for dividend domain functions

Key patterns you MUST follow:
- Use `describe` and `it` blocks (globals enabled in vitest.config.ts)
- Have REAL `expect()` assertions (no empty scaffolds or TODO comments)
- Cover edge cases: empty inputs, missing data, boundary conditions
- Mock side effects: localStorage, timers, API calls
- Use factory helpers for test data (keeps fixtures terse and deterministic)

Before you start:
1. Run: git checkout main && git pull origin main
2. Create branch: git checkout -b feature/dividend-calculation-tests
3. Run: npm test (see current coverage and patterns)
4. Read the actual test files above to match the style

When done, provide reality snapshot:
- git status -sb
- git log --oneline -n 1
- npm run build output
- npm test output (FULL test results showing new tests passing)
```

---

## Agent 6: Add Comparison Chart (Multiple Stocks)

```
You are Agent 6: Historical Analysis & Charts for Aurora Invest App.

CRITICAL: Study these files to understand existing historical patterns:

1. lib/domain/auroraEngine.ts - Historical functions
   - calculateReturns(historical): { period, annualized }
   - detectTrend(historical): 'uptrend' | 'downtrend' | 'sideways'
   - calculateVolatility(historical): number (annualized %)
   - All functions are PURE (no side effects, deterministic)

2. lib/domain/AnalysisTypes.ts - Historical types
   - HistoricalData: { ticker, period, dataPoints: Array<{date, price}> }
   - HistoricalMetrics: { returns, trend, volatility }
   - Period: '1M' | '3M' | '6M' | '1Y' | '5Y'

3. components/historical-chart.tsx
   - Uses Recharts: LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer
   - Receives data via props (historicalData prop)
   - Period selector: buttons for 1M, 3M, 6M, 1Y, 5Y
   - Formatting: date.toLocaleDateString(), price.toFixed(2)
   - Responsive: ResponsiveContainer with width="100%" height={300}

4. components/historical-card.tsx
   - Displays calculated metrics from domain functions
   - Shows returns (period % and annualized %)
   - Shows trend badge with color coding (uptrend=green, downtrend=red, sideways=gray)
   - Shows volatility with risk level indicator
   - Uses Card primitives from components/ui/card.tsx

5. lib/services/marketDataService.ts
   - fetchHistoricalData(ticker, period): Promise<HistoricalData>
   - Demo mode returns mock historical data
   - Real mode fetches from Alpha Vantage TIME_SERIES_DAILY

Your task: Add comparison chart for multiple stocks
- Create components/comparison-chart.tsx with 'use client' directive
- Accept array of tickers: comparisonTickers prop (e.g., ['AAPL', 'MSFT', 'GOOGL'])
- Fetch historical data for all tickers in parallel
- Normalize prices to percentage change from start date (for fair comparison)
- Display multiple Line components in single chart (different colors per ticker)
- Add legend showing ticker names with color coding
- Period selector: 1M, 3M, 6M, 1Y, 5Y (applies to all tickers)
- Tooltip shows all tickers' values on hover
- Use Recharts: LineChart, Line (multiple), XAxis, YAxis, Tooltip, Legend, ResponsiveContainer

Key patterns you MUST follow:
- Add all historical types to AnalysisTypes.ts first (not inline)
- Keep domain functions PURE: calculateReturns, detectTrend, calculateVolatility
- Use Recharts library: LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip
- Service layer handles data fetching (fetchHistoricalData)
- Domain layer handles calculations (calculateReturns, etc.)
- Support multiple time periods: '1M', '3M', '6M', '1Y', '5Y'
- Period selector: button group to switch timeframes
- Format dates: toLocaleDateString(), format prices: toFixed(2)

Before you start:
1. Run: git checkout main && git pull origin main
2. Create branch: git checkout -b feature/comparison-chart
3. Run: npm run build (should pass)
4. Read the actual files above to match the patterns

When done, provide reality snapshot:
- git status -sb
- git log --oneline -n 1
- npm run build output
- npm test output (show historical calculation tests)
- Browser test at http://localhost:3000 (show chart screenshot)
```

---

## Agent 7: Portfolio Management (ALREADY COMPLETE)

```
You are Agent 7: Portfolio Management for Aurora Invest App.

Study these files first:
- lib/domain/auroraEngine.ts - Pure function pattern for portfolio calculations
- lib/domain/AnalysisTypes.ts - Type definition pattern
- lib/services/marketDataService.ts - Service interface pattern
- lib/services/implementations/DemoMarketDataService.ts - localStorage usage example
- components/risk-card.tsx - Card component pattern
- components/analysis-dashboard.tsx - Dashboard with state management
- lib/domain/__tests__/auroraEngine.test.ts - Domain test structure
- lib/services/__tests__/marketDataService.test.ts - Service test with mocking

CRITICAL: Study the existing patterns before starting:

From lib/domain/auroraEngine.ts - Learn function patterns:
- Follow naming: calculatePortfolioMetrics (like calculateFundamentalsQualityScore)
- Follow naming: calculateAllocation (like calculateReturns)
- Follow naming: detectConcentrationRisk (like detectTrend)
- All functions PURE (no API calls, no localStorage, deterministic)
- Use JSDoc comments matching existing style

From lib/services/implementations/DemoMarketDataService.ts - Learn localStorage:
- Use localStorage.getItem('key') and localStorage.setItem('key', JSON.stringify(data))
- Handle window === 'undefined' for SSR
- Create service class: LocalStoragePortfolioService
- Export singleton: export const portfolioService = new LocalStoragePortfolioService()

From components/risk-card.tsx - Learn card patterns:
- 'use client' directive at top
- Use Card, CardHeader, CardTitle, CardContent from components/ui/card
- Use severityStyles pattern for status-based styling
- Use cn() for conditional classNames
- Use TooltipProvider for hover info

From lib/domain/__tests__/auroraEngine.test.ts - Learn test patterns:
- Factory helpers: const createPortfolio = (holdings) => ({ id, name, holdings, ... })
- Real assertions: expect(metrics.totalValue).toBe(10000)
- Edge cases: empty portfolio, single holding, missing prices
- Mock localStorage: global.localStorage = mockStorage

Your task: Add portfolio tracking and management system
- Track holdings (ticker, shares, cost basis, purchase date)
- Calculate portfolio metrics (value, gain/loss, beta, volatility)
- Display portfolio dashboard with holdings table
- Show portfolio context when analyzing stocks
- Detect concentration risk and suggest actions

Key patterns you MUST follow:
- Domain functions PURE: calculatePortfolioMetrics, calculateAllocation, detectConcentrationRisk
- Service handles localStorage: LocalStoragePortfolioService (study DemoMarketDataService pattern)
- UI uses 'use client' and follows Card/Button primitives from components/ui/
- Tests with factory helpers and REAL assertions (study auroraEngine.test.ts)
- Start from latest main to avoid merge conflicts (git checkout main && git pull)

Files to create:
- lib/domain/portfolioEngine.ts
- lib/services/portfolioService.ts
- lib/domain/__tests__/portfolioEngine.test.ts
- lib/services/__tests__/portfolioService.test.ts
- components/portfolio-dashboard.tsx
- app/portfolio/page.tsx

Before you start:
1. Run: git checkout main && git pull origin main
2. Create branch: git checkout -b feature/agent7-portfolio-management
3. Run: npm run build (should pass)

When done, provide reality snapshot:
- git status -sb
- git log --oneline -n 1
- npm run build output
- npm test output (should show 15+ new tests passing)
- Browser test at http://localhost:3000/portfolio
```

---

**How to use these:**

1. Choose the agent/task you want
2. Copy the entire code block (everything between the triple backticks)
3. Paste directly into Cursor agent interface
4. Agent will immediately start working

No need to fill in any placeholders - these are complete and ready to go!
