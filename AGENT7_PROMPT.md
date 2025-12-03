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

Your task: Add portfolio tracking and management system
- Track holdings (ticker, shares, cost basis, purchase date)
- Calculate portfolio metrics (value, gain/loss, beta, volatility)
- Display portfolio dashboard with holdings table
- Show portfolio context when analyzing stocks
- Detect concentration risk and suggest actions

Key patterns to follow:
- Domain functions must be pure (calculatePortfolioMetrics, calculateAllocation)
- Service handles localStorage persistence (LocalStoragePortfolioService)
- UI uses 'use client' and follows existing card patterns
- Tests must have real assertions, mock localStorage in service tests
- Start from latest main to avoid merge conflicts

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
