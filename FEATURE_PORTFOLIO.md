# 📊 Feature Request: Portfolio Management

**Created:** 2025-12-03
**Status:** Planning
**Assigned to:** Agent 7 (Portfolio Management)

---

## 🎯 Feature Overview

Add portfolio management capabilities to Aurora Invest App, allowing users to:
- Track multiple stock holdings
- View portfolio performance and metrics
- Analyze portfolio-level risk and diversification
- Compare individual stocks against portfolio benchmarks

---

## 📋 User Stories

### As an investor, I want to:
1. **Add stocks to my portfolio** with quantity and purchase price
2. **View my portfolio holdings** in a dashboard with current values
3. **See portfolio performance** (total return, daily/weekly/monthly gains)
4. **Analyze portfolio risk** (beta, volatility, correlation)
5. **View asset allocation** (sector breakdown, position sizing)
6. **Compare stocks** against my portfolio performance
7. **Track cost basis** and unrealized gains/losses
8. **Export portfolio data** for tax reporting

---

## 🏗️ Technical Design

### Domain Layer (lib/domain/)

**New File:** `lib/domain/portfolioEngine.ts`
```typescript
// Core portfolio types and calculations

export interface PortfolioHolding {
  ticker: string;
  shares: number;
  averageCostBasis: number;
  purchaseDate: string;
  currentPrice?: number;
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
  dailyChange: number;
  dailyChangePct: number;
  beta: number;
  volatility: number;
  sharpeRatio: number;
}

export interface PortfolioAllocation {
  ticker: string;
  value: number;
  weightPct: number;
  sector?: string;
}

// Pure functions
export function calculatePortfolioMetrics(
  portfolio: Portfolio,
  currentPrices: Map<string, number>
): PortfolioMetrics;

export function calculateAllocation(
  portfolio: Portfolio,
  currentPrices: Map<string, number>
): PortfolioAllocation[];

export function calculatePortfolioBeta(
  holdings: PortfolioHolding[],
  stockBetas: Map<string, number>
): number;

export function detectConcentrationRisk(
  allocations: PortfolioAllocation[]
): { level: 'low' | 'moderate' | 'high'; warnings: string[] };
```

**Update:** `lib/domain/AnalysisTypes.ts`
```typescript
// Add portfolio context to stock analysis
export interface PortfolioContext {
  portfolioId: string;
  existingHolding?: PortfolioHolding;
  portfolioMetrics: PortfolioMetrics;
  suggestedAction: 'buy' | 'hold' | 'sell' | 'rebalance';
  reasoning: string[];
}
```

### Service Layer (lib/services/)

**New File:** `lib/services/portfolioService.ts`
```typescript
// Portfolio persistence and data fetching

export interface PortfolioService {
  // CRUD operations
  createPortfolio(name: string): Promise<Portfolio>;
  getPortfolio(id: string): Promise<Portfolio | null>;
  updatePortfolio(portfolio: Portfolio): Promise<void>;
  deletePortfolio(id: string): Promise<void>;

  // Holding management
  addHolding(portfolioId: string, holding: PortfolioHolding): Promise<void>;
  updateHolding(portfolioId: string, ticker: string, updates: Partial<PortfolioHolding>): Promise<void>;
  removeHolding(portfolioId: string, ticker: string): Promise<void>;

  // Data fetching
  getCurrentPrices(tickers: string[]): Promise<Map<string, number>>;
  getHistoricalPortfolioValue(portfolio: Portfolio, period: string): Promise<HistoricalData>;
}

// Implementation: LocalStoragePortfolioService
// For now, store in browser localStorage
// Later: upgrade to database (Supabase, Firebase, etc.)
```

### UI Components (components/)

**New File:** `components/portfolio-dashboard.tsx`
- Portfolio overview card (total value, daily change, return)
- Holdings table (ticker, shares, cost basis, current value, gain/loss)
- Add/Edit/Remove holding dialogs

**New File:** `components/portfolio-chart.tsx`
- Portfolio value over time (line chart)
- Asset allocation pie chart
- Sector breakdown

**New File:** `components/portfolio-metrics-card.tsx`
- Beta, Volatility, Sharpe Ratio
- Concentration risk warnings
- Diversification score

**New File:** `components/add-holding-dialog.tsx`
- Form to add new holdings (ticker, shares, cost basis, date)
- Validation and error handling

**Update:** `components/analysis-dashboard.tsx`
- Add "Add to Portfolio" button
- Show portfolio context if stock is already held
- Display suggested action (buy more, hold, trim, etc.)

### Application Layer (app/)

**New Page:** `app/portfolio/page.tsx`
- Main portfolio view
- Route: `/portfolio`
- Show all portfolios (if multiple support)
- Current portfolio dashboard

**Update:** `app/page.tsx`
- Link to portfolio from stock analysis
- "Add to Portfolio" action after analysis

### Data Storage

**Browser localStorage** (Phase 1):
```typescript
// Store portfolios in localStorage for now
localStorage.setItem('aurora_portfolios', JSON.stringify(portfolios));
```

**Future:** Database integration (Phase 2)
- Supabase / Firebase / PostgreSQL
- User authentication
- Cloud sync across devices

---

## 🎨 UI/UX Mockup

### Portfolio Dashboard View
```
┌─────────────────────────────────────────────────────────┐
│ 📊 My Portfolio                          [+ Add Stock]  │
├─────────────────────────────────────────────────────────┤
│ Portfolio Value: $52,450.00    Daily: +$425 (+0.82%)   │
│ Total Gain: +$8,450 (+19.2%)                            │
├─────────────────────────────────────────────────────────┤
│ Holdings                                                │
│ ┌───────────────────────────────────────────────────┐   │
│ │ Ticker │ Shares │ Avg Cost │ Current │ Gain/Loss │   │
│ ├────────┼────────┼──────────┼─────────┼───────────┤   │
│ │ AAPL   │ 50     │ $150.00  │ $175.00 │ +$1,250   │   │
│ │ MSFT   │ 30     │ $280.00  │ $310.00 │ +$900     │   │
│ │ GOOGL  │ 25     │ $120.00  │ $140.00 │ +$500     │   │
│ └───────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│ Asset Allocation          │  Risk Metrics              │
│ [Pie Chart]              │  Beta: 1.08                │
│                          │  Volatility: 18.5%         │
│                          │  Sharpe Ratio: 1.42        │
└─────────────────────────────────────────────────────────┘
```

### Stock Analysis with Portfolio Context
```
┌─────────────────────────────────────────────────────────┐
│ AAPL - Apple Inc.                                       │
├─────────────────────────────────────────────────────────┤
│ Your Portfolio                                          │
│ Currently holding: 50 shares @ $150.00 avg cost        │
│ Current value: $8,750 (+$1,250 gain)                   │
│                                                         │
│ 💡 Suggested Action: HOLD                              │
│ • Position size is appropriate (16.7% of portfolio)    │
│ • Stock trading near fair value                        │
│ • Consider trimming if exceeds 20% allocation          │
│                                                         │
│ [Add More Shares] [View Portfolio]                     │
└─────────────────────────────────────────────────────────┘
```

---

## 🧪 Testing Strategy

### Domain Tests (lib/domain/__tests__/portfolioEngine.test.ts)
```typescript
describe('calculatePortfolioMetrics', () => {
  it('calculates total value and gain/loss correctly');
  it('handles empty portfolio gracefully');
  it('calculates weighted beta across holdings');
});

describe('calculateAllocation', () => {
  it('computes position weights correctly');
  it('sums to 100% allocation');
});

describe('detectConcentrationRisk', () => {
  it('flags single positions over 25%');
  it('detects sector concentration');
  it('returns low risk for well-diversified portfolio');
});
```

### Service Tests (lib/services/__tests__/portfolioService.test.ts)
```typescript
describe('LocalStoragePortfolioService', () => {
  it('creates and retrieves portfolios');
  it('adds and removes holdings');
  it('fetches current prices for all tickers');
  it('persists changes to localStorage');
});
```

### Component Tests
- Portfolio dashboard renders holdings correctly
- Add holding dialog validates inputs
- Portfolio metrics card displays data accurately

---

## 📦 Implementation Steps

### Phase 1: Core Portfolio Functionality (Agent 7)
1. ✅ Create domain types and pure functions (portfolioEngine.ts)
2. ✅ Implement localStorage service (LocalStoragePortfolioService)
3. ✅ Create portfolio dashboard UI (portfolio-dashboard.tsx)
4. ✅ Add holdings table and CRUD operations
5. ✅ Calculate basic metrics (value, gain/loss, allocation)
6. ✅ Write comprehensive tests
7. ✅ Update stock analysis to show portfolio context
8. ✅ Build and test

### Phase 2: Advanced Analytics (Agent 8 - Future)
1. Historical portfolio value tracking
2. Performance charts (time series)
3. Benchmark comparison (S&P 500, sector indices)
4. Tax lot tracking (FIFO, LIFO)
5. Dividend tracking and income reporting

### Phase 3: Cloud Sync (Agent 9 - Future)
1. User authentication (Clerk, Auth0, or Supabase Auth)
2. Database integration (Supabase/PostgreSQL)
3. Multi-device sync
4. Portfolio sharing and collaboration

---

## 🎯 Success Criteria

### Must Have (Phase 1)
- ✅ User can add/edit/remove holdings
- ✅ Portfolio dashboard shows current value and gain/loss
- ✅ Asset allocation visualization (pie chart)
- ✅ Position sizing warnings (concentration risk)
- ✅ Stock analysis integrates with portfolio context
- ✅ Data persists in localStorage
- ✅ Build passes with 0 TypeScript errors
- ✅ 15+ tests covering domain and service layers

### Nice to Have (Phase 2+)
- Historical portfolio value tracking
- Performance vs benchmarks
- Tax reporting (cost basis, realized gains)
- Dividend tracking
- Cloud sync and multi-device support

---

## 🚀 Agent 7 Mega Prompt (Ready to Use)

See: [CURSOR_MEGA_PROMPTS.md - Agent 7](CURSOR_MEGA_PROMPTS.md#agent-7-portfolio-management)

Quick start:
```
Agent 7: Add portfolio management to Aurora Invest App

Read CURSOR_MEGA_PROMPTS.md#agent-7 for full constraints.

Task: Implement core portfolio functionality
- Create lib/domain/portfolioEngine.ts with pure functions
- Create lib/services/portfolioService.ts (localStorage implementation)
- Create components/portfolio-dashboard.tsx
- Create app/portfolio/page.tsx
- Update components/analysis-dashboard.tsx with portfolio context
- Write 15+ tests with real assertions
- Run: npm run build && npm test

Follow all hard constraints from past agents.
Show reality snapshot when done.
```

---

## 📚 Related Documentation

- [CURSOR_MEGA_PROMPTS.md](CURSOR_MEGA_PROMPTS.md) - Agent templates
- [PROJECT_COMPLETE.md](PROJECT_COMPLETE.md) - Current system status
- [AGENT_STATUS.md](AGENT_STATUS.md) - Track agent work

---

## 🔧 Technical Notes

### Why localStorage first?
- Zero external dependencies
- Instant setup (no auth, no database)
- Perfect for MVP and demo
- Easy to migrate to database later

### Future Database Schema
```sql
CREATE TABLE portfolios (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE holdings (
  id UUID PRIMARY KEY,
  portfolio_id UUID REFERENCES portfolios(id),
  ticker TEXT NOT NULL,
  shares DECIMAL NOT NULL,
  average_cost_basis DECIMAL NOT NULL,
  purchase_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

**Last Updated:** 2025-12-03
**Status:** Ready for Agent 7 implementation
**Priority:** High (user-requested feature)
**Estimated Scope:** ~1,500 lines of code + tests
