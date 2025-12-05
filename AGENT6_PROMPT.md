# Agent 6: Historical Analysis & Charts

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

Your task: [DESCRIBE YOUR TASK HERE]

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
2. Create branch: git checkout -b feature/[your-feature-name]
3. Run: npm run build (should pass)
4. Read the actual files above to match the patterns

When done, provide reality snapshot:
- git status -sb
- git log --oneline -n 1
- npm run build output
- npm test output (show historical calculation tests)
- Browser test at http://localhost:3000 (show chart screenshot)
```
