# 🤖 Agent Descriptions & Key Files

Quick reference for what each agent does and which files they should study.

---

## 1. Agent 1: Domain Engine Specialist

**What they do**: Add pure domain logic functions (scoring algorithms, calculations)

**Files to study**:
- `lib/domain/auroraEngine.ts` - Pure functions (no side effects)
- `lib/domain/AnalysisTypes.ts` - Type definitions with JSDoc
- `lib/domain/__tests__/auroraEngine.test.ts` - Test patterns

**Key patterns to follow**:
- Functions must be pure (deterministic, no side effects)
- Add types to AnalysisTypes.ts, not inline
- Use JSDoc comments for documentation
- All functions must be testable with known inputs/outputs

---

## 2. Agent 2: Service Layer & API Integration

**What they do**: Connect external APIs, add data sources

**Files to study**:
- `lib/services/marketDataService.ts` - Service interface pattern
- `lib/services/implementations/DemoMarketDataService.ts` - Demo/fallback implementation
- `lib/services/implementations/AlphaVantageService.ts` - Real API integration
- `lib/services/__tests__/marketDataService.test.ts` - Service testing pattern

**Key patterns to follow**:
- Define interface in service file, implement in implementations/
- Keep demo mode working (fallback when no API key)
- Handle errors gracefully (timeouts, rate limits, invalid responses)
- Never commit API keys (use .env.local)

---

## 3. Agent 3: UI/UX & Components

**What they do**: Build UI components, cards, visual elements

**Files to study**:
- `components/risk-card.tsx` - Card component pattern with data display
- `components/analysis-dashboard.tsx` - Dashboard composition with state
- `components/ui/card.tsx` - Base Radix UI card component
- `components/ui/button.tsx` - Base Radix UI button component

**Key patterns to follow**:
- Use 'use client' directive for interactive components
- Follow Radix UI + Tailwind CSS styling patterns
- Responsive design (mobile-first with md:, lg: breakpoints)
- Import domain functions, never duplicate logic in components

---

## 4. Agent 4: Application Orchestration

**What they do**: Page logic, error handling, loading states, caching

**Files to study**:
- `app/page.tsx` - Page-level state management and data fetching
- `components/analysis-dashboard.tsx` - Progressive loading states pattern

**Key patterns to follow**:
- Progressive loading states (fetching → analyzing → presenting)
- User-friendly error messages (not raw error objects)
- Request queuing to prevent duplicates
- Caching for performance (store last N results)
- Retry logic with exponential backoff

---

## 5. Agent 5: Testing & Quality

**What they do**: Add tests, improve test coverage

**Files to study**:
- `lib/domain/__tests__/auroraEngine.test.ts` - Domain test structure with describe/it/expect
- `lib/services/__tests__/marketDataService.test.ts` - Service test with mocking
- `vitest.config.ts` - Test configuration and setup

**Key patterns to follow**:
- Use `describe` and `it` blocks
- Have real `expect()` assertions (no scaffolds)
- Cover edge cases (empty inputs, boundary conditions)
- Mock side effects like localStorage in service tests

---

## 6. Agent 6: Historical Analysis & Charts

**What they do**: Time-series data, historical analysis, charts

**Files to study**:
- `lib/domain/auroraEngine.ts` - Historical calculation functions (calculateReturns, detectTrend)
- `lib/domain/AnalysisTypes.ts` - HistoricalData type definitions
- `components/historical-chart.tsx` - Recharts integration pattern
- `components/historical-card.tsx` - Historical metrics display
- `lib/services/marketDataService.ts` - getHistoricalData method

**Key patterns to follow**:
- Add historical types to AnalysisTypes.ts first
- Keep domain functions pure (calculateReturns, detectTrend, calculateVolatility)
- Use Recharts library for time-series visualization
- Service layer handles data fetching, domain handles calculations
- Support multiple time periods (1M, 3M, 6M, 1Y, 5Y)

---

## 7. Agent 7: Portfolio Management

**What they do**: Track holdings, calculate portfolio metrics, detect risk

**Files to study**:
- `lib/domain/auroraEngine.ts` - Pure function pattern for portfolio calculations
- `lib/domain/AnalysisTypes.ts` - Type definition pattern
- `lib/services/marketDataService.ts` - Service interface pattern
- `lib/services/implementations/DemoMarketDataService.ts` - localStorage usage example
- `components/risk-card.tsx` - Card component pattern
- `components/analysis-dashboard.tsx` - Dashboard with state management
- `lib/domain/__tests__/auroraEngine.test.ts` - Domain test structure
- `lib/services/__tests__/marketDataService.test.ts` - Service test with mocking

**Key patterns to follow**:
- Domain functions must be pure (calculatePortfolioMetrics, calculateAllocation)
- Service handles localStorage persistence (LocalStoragePortfolioService)
- UI uses 'use client' and follows existing card patterns
- Tests must have real assertions, mock localStorage in service tests
- Start from latest main to avoid merge conflicts

---

**Last Updated**: 2025-12-03
