# Agent 7: Portfolio Management

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
