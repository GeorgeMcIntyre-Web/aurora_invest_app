# 🤖 Agent 7: Portfolio Management - Briefing

**Your Role**: Add portfolio tracking and management to Aurora Invest App

---

## 📋 What You Need to Do

Add functionality to:
1. Track stock holdings (ticker, shares, cost basis, purchase date)
2. Calculate portfolio metrics (value, gain/loss, beta, volatility)
3. Display portfolio dashboard with holdings table
4. Show portfolio context when analyzing stocks
5. Detect concentration risk and suggest actions

---

## 📂 Files to Study First

### Understand the Domain Pattern
- **`lib/domain/auroraEngine.ts`** - See how pure domain functions work
- **`lib/domain/AnalysisTypes.ts`** - See type definitions pattern
- **`lib/domain/__tests__/auroraEngine.test.ts`** - See test pattern

### Understand the Service Pattern
- **`lib/services/marketDataService.ts`** - See service interface pattern
- **`lib/services/implementations/DemoMarketDataService.ts`** - See localStorage usage
- **`lib/services/__tests__/marketDataService.test.ts`** - See service test pattern

### Understand the UI Pattern
- **`components/risk-card.tsx`** - See card component pattern
- **`components/analysis-dashboard.tsx`** - See dashboard pattern with state
- **`app/page.tsx`** - See page structure with async data

### Study the Architecture
- **`ARCHITECTURE.md`** - Understand domain-driven design
- **`MODULE_BOUNDARIES.md`** - Know where code belongs

---

## 🎯 Files You'll Create

### Domain Layer (Pure Functions)
```
lib/domain/portfolioEngine.ts
├── Portfolio types (Portfolio, PortfolioHolding, PortfolioMetrics)
├── calculatePortfolioMetrics() - pure function
├── calculateAllocation() - pure function
├── detectConcentrationRisk() - pure function
└── suggestPortfolioAction() - pure function

lib/domain/__tests__/portfolioEngine.test.ts
└── 10+ tests with real assertions
```

### Service Layer (Persistence)
```
lib/services/portfolioService.ts
├── PortfolioService interface
├── LocalStoragePortfolioService class
└── Singleton instance export

lib/services/__tests__/portfolioService.test.ts
└── 5+ tests with localStorage mocking
```

### UI Layer (Components & Pages)
```
components/portfolio-dashboard.tsx
├── Portfolio overview card
├── Holdings table
└── Risk metrics display

app/portfolio/page.tsx
└── Portfolio route (/portfolio)
```

---

## 🔑 Key Patterns to Follow

### 1. Domain Functions MUST Be Pure
```typescript
// ✅ GOOD - Pure function
export function calculatePortfolioMetrics(
  portfolio: Portfolio,
  currentPrices: Map<string, number>
): PortfolioMetrics {
  // Only uses inputs, no side effects
  const totalValue = portfolio.holdings.reduce(...);
  return { totalValue, ... };
}

// ❌ BAD - Has side effects
export function calculatePortfolioMetrics(portfolio: Portfolio) {
  fetch('/api/prices'); // NO! Side effect
  localStorage.setItem(...); // NO! Side effect
}
```

### 2. Services Handle Side Effects
```typescript
// ✅ GOOD - Service handles persistence
export class LocalStoragePortfolioService {
  async savePortfolio(portfolio: Portfolio): Promise<void> {
    localStorage.setItem('aurora_portfolios', JSON.stringify(portfolio));
  }
}
```

### 3. UI Components Use 'use client'
```typescript
// ✅ GOOD - Client component
'use client';

export function PortfolioDashboard() {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  // ... component logic
}
```

### 4. Tests Must Have Real Assertions
```typescript
// ✅ GOOD - Real test
describe('calculatePortfolioMetrics', () => {
  it('calculates total value correctly', () => {
    const portfolio = createTestPortfolio();
    const metrics = calculatePortfolioMetrics(portfolio, priceMap);
    expect(metrics.totalValue).toBe(10000); // Real assertion
  });
});

// ❌ BAD - Empty scaffold
describe('calculatePortfolioMetrics', () => {
  it('should work', () => {
    // TODO: implement
  });
});
```

---

## ⚠️ Hard Constraints (From Past Agents)

### 1. Start from Latest Main
```bash
git checkout main
git pull origin main
git checkout -b feature/agent7-portfolio-management
```

### 2. Build Must Pass
```bash
npm run build  # Must show 0 errors
```

### 3. Tests Must Pass
```bash
npm test  # Must show 15+ tests passing
```

### 4. Provide Reality Snapshot
Show actual command output:
- `git status -sb`
- `git log --oneline -n 1`
- `npm run build` result
- `npm test` result

---

## 📊 Example Type Definitions

```typescript
// What portfolio types should look like
export interface PortfolioHolding {
  ticker: string;
  shares: number;
  averageCostBasis: number;
  purchaseDate: string;
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
```

---

## 🧪 Test Examples to Follow

Study these test files to understand the pattern:
- `lib/domain/__tests__/auroraEngine.test.ts` - Domain test structure
- `lib/services/__tests__/marketDataService.test.ts` - Service test with mocking

Your tests should:
- Use `describe` and `it` blocks
- Have real `expect()` assertions
- Cover edge cases (empty portfolio, single holding)
- Mock localStorage in service tests

---

## 📖 Full Documentation

For complete implementation details:
- **Full Spec**: `FEATURE_PORTFOLIO.md`
- **Complete Code Templates**: `CURSOR_MEGA_PROMPTS.md#agent-7`
- **Roadmap**: `PORTFOLIO_ROADMAP.md`

---

## ✅ Success Checklist

Before you're done:
- [ ] All files created (domain, service, UI, tests)
- [ ] `npm run build` passes with 0 errors
- [ ] `npm test` shows 15+ tests passing
- [ ] All tests have real assertions (no scaffolds)
- [ ] Domain functions are pure (no side effects)
- [ ] localStorage service works
- [ ] Portfolio dashboard renders
- [ ] Code committed and pushed
- [ ] Reality snapshot provided

---

**Quick Reference**:
- Main branch: `528a326`
- Stack: Next.js 14, TypeScript, Vitest, localStorage
- Pattern: Domain (pure) → Service (side effects) → UI (components)

**Your mission**: Add portfolio management following the exact patterns used by Agents 1-6.
