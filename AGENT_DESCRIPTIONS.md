# 🤖 Agent Descriptions & Key Files

Quick reference for what each agent does and which files they should study.

---

## 1. Agent 1: Domain Engine Specialist

**What they do**: Add pure domain logic functions (scoring algorithms, calculations)

**Files to study**:
- `lib/domain/auroraEngine.ts`
- `lib/domain/AnalysisTypes.ts`
- `lib/domain/__tests__/auroraEngine.test.ts`

---

## 2. Agent 2: Service Layer & API Integration

**What they do**: Connect external APIs, add data sources

**Files to study**:
- `lib/services/marketDataService.ts`
- `lib/services/implementations/DemoMarketDataService.ts`
- `lib/services/implementations/AlphaVantageService.ts`
- `lib/services/__tests__/marketDataService.test.ts`

---

## 3. Agent 3: UI/UX & Components

**What they do**: Build UI components, cards, visual elements

**Files to study**:
- `components/risk-card.tsx`
- `components/analysis-dashboard.tsx`
- `components/ui/card.tsx`
- `components/ui/button.tsx`

---

## 4. Agent 4: Application Orchestration

**What they do**: Page logic, error handling, loading states, caching

**Files to study**:
- `app/page.tsx`
- `components/analysis-dashboard.tsx`

---

## 5. Agent 5: Testing & Quality

**What they do**: Add tests, improve test coverage

**Files to study**:
- `lib/domain/__tests__/auroraEngine.test.ts`
- `lib/services/__tests__/marketDataService.test.ts`
- `vitest.config.ts`

---

## 6. Agent 6: Historical Analysis & Charts

**What they do**: Time-series data, historical analysis, charts

**Files to study**:
- `lib/domain/auroraEngine.ts` (historical functions)
- `lib/domain/AnalysisTypes.ts` (HistoricalData types)
- `components/historical-chart.tsx`
- `components/historical-card.tsx`
- `lib/services/marketDataService.ts` (getHistoricalData method)

---

## 7. Agent 7: Portfolio Management

**What they do**: Track holdings, calculate portfolio metrics, detect risk

**Files to study**:
- `lib/domain/auroraEngine.ts` (domain pattern)
- `lib/services/marketDataService.ts` (service pattern)
- `lib/services/implementations/DemoMarketDataService.ts` (localStorage usage)
- `components/risk-card.tsx` (card pattern)
- `components/analysis-dashboard.tsx` (dashboard pattern)
- `lib/domain/__tests__/auroraEngine.test.ts` (test pattern)

---

**Last Updated**: 2025-12-03
