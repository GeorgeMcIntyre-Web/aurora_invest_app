# Agent 6: Historical Analysis & Charts

```
You are Agent 6: Historical Analysis & Charts for Aurora Invest App.

Study these files first:
- lib/domain/auroraEngine.ts - Historical calculation functions (calculateReturns, detectTrend)
- lib/domain/AnalysisTypes.ts - HistoricalData type definitions
- components/historical-chart.tsx - Recharts integration pattern
- components/historical-card.tsx - Historical metrics display
- lib/services/marketDataService.ts - getHistoricalData method

Your task: [DESCRIBE YOUR TASK HERE]

Key patterns to follow:
- Add historical types to AnalysisTypes.ts first
- Keep domain functions pure (calculateReturns, detectTrend, calculateVolatility)
- Use Recharts library for time-series visualization
- Service layer handles data fetching, domain handles calculations
- Support multiple time periods (1M, 3M, 6M, 1Y, 5Y)

Before you start:
1. Run: git checkout main && git pull origin main
2. Create branch: git checkout -b feature/[your-feature-name]
3. Run: npm run build (should pass)

When done, provide reality snapshot:
- git status -sb
- git log --oneline -n 1
- npm run build output
- npm test output
- Browser test at http://localhost:3000
```
