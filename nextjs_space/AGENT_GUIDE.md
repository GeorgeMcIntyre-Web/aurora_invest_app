# 🤖 AI Agent Guide for AuroraInvest Stock Analyzer

This document provides comprehensive instructions for AI agents working on this codebase. Read this first before making any changes.

## 🎯 Project Overview

**AuroraInvest Stock Analyzer** is a Next.js 14 application that provides educational stock analysis. It uses a pure domain engine to analyze stocks based on fundamentals, technicals, sentiment, and generates scenario-based planning guidance.

**Critical Constraint**: This is an **educational tool only** - it must NEVER provide personalized financial advice. All guidance uses framework language ("many investors with similar profiles...") and emphasizes uncertainty.

## 📋 Quick Start for Agents

### Before You Start
1. **Read** `ARCHITECTURE.md` to understand the system structure
2. **Read** `MODULE_BOUNDARIES.md` to understand separation of concerns
3. **Read** `CONTRIBUTING.md` for coding patterns and conventions
4. **Review** the existing code in the module you're working on

### Key Entry Points
- **Main App**: `app/page.tsx` - Entry point, orchestrates form + dashboard
- **Domain Engine**: `lib/domain/auroraEngine.ts` - Pure analysis logic (NO side effects)
- **Data Service**: `lib/services/marketDataService.ts` - Data abstraction layer
- **Types**: `lib/domain/AnalysisTypes.ts` - All domain types and interfaces
- **UI Components**: `components/` - React components for display

## 🔧 Mega Prompts for Common Tasks

### Task: Add a New Analysis Dimension

**Context**: You need to add a new analysis dimension (e.g., "ESG Score", "Sector Analysis", "Macro Indicators")

**Steps**:
1. **Update Types** (`lib/domain/AnalysisTypes.ts`):
   - Add new fields to `StockData` interface if needed
   - Add new fields to `AnalysisResult` interface
   - Export new types if they're reusable

2. **Update Domain Engine** (`lib/domain/auroraEngine.ts`):
   - Create a pure function to analyze the new dimension (e.g., `analyzeESG(stock: StockData)`)
   - Add it to the `analyzeStock` pipeline
   - Create a view composer function (e.g., `composeESGView(...)`)
   - **CRITICAL**: Keep it pure - no API calls, no side effects, deterministic

3. **Update Data Service** (`lib/services/marketDataService.ts`):
   - If new data is needed, add it to `StockData` interface
   - Update `MockMarketDataService` to include mock data
   - For real API integration, add data fetching logic (but keep it in the service layer)

4. **Update UI** (`components/analysis-dashboard.tsx`):
   - Add a new card component (e.g., `ESGCard.tsx`)
   - Import and render it in `AnalysisDashboard`
   - Follow existing card patterns for consistency

5. **Test**:
   - Verify the new dimension appears in analysis results
   - Check that mock data includes the new fields
   - Ensure no TypeScript errors

**Example Pattern**:
```typescript
// In auroraEngine.ts
function analyzeNewDimension(stock: StockData): NewDimensionResult {
  // Pure logic only
  return { /* ... */ };
}

// In analyzeStock function
const newDimension = analyzeNewDimension(stock);
const newDimensionView = composeNewDimensionView(newDimension);
```

---

### Task: Integrate a Real Market Data API

**Context**: Replace mock data with real API calls (e.g., Alpha Vantage, Yahoo Finance, Polygon.io)

**Steps**:
1. **Create New Service Implementation** (`lib/services/marketDataService.ts`):
   - Create `RealMarketDataService` class implementing `MarketDataService`
   - Map API response to `StockData` interface
   - Handle errors gracefully (network, rate limits, invalid tickers)
   - Add retry logic if appropriate

2. **Update Factory Function**:
   - Modify `createMarketDataService()` to check environment variable
   - Default to mock for development, real API for production
   - Example: `process.env.NEXT_PUBLIC_USE_REAL_API === 'true'`

3. **Add Environment Variables**:
   - Document required API keys in `.env.example`
   - Never commit API keys to git
   - Use Next.js environment variable conventions

4. **Update Error Handling**:
   - Map API-specific errors to user-friendly messages
   - Handle rate limiting (show appropriate message)
   - Handle invalid tickers (suggest valid format)

5. **Test**:
   - Test with real API (use test account if available)
   - Test error cases (invalid ticker, network failure, rate limit)
   - Ensure fallback behavior is graceful

**Example Pattern**:
```typescript
export class RealMarketDataService implements MarketDataService {
  private apiKey: string;
  
  constructor() {
    this.apiKey = process.env.ALPHA_VANTAGE_API_KEY || '';
    if (!this.apiKey) throw new Error('API key required');
  }
  
  async fetchStockData(ticker: string): Promise<StockData> {
    // Fetch from API
    // Map to StockData interface
    // Handle errors
  }
}
```

---

### Task: Add a New UI Component

**Context**: Create a new display component (e.g., comparison chart, risk heatmap, portfolio view)

**Steps**:
1. **Create Component File** (`components/your-component.tsx`):
   - Use TypeScript with proper interfaces
   - Follow existing component patterns (see `fundamentals-card.tsx` for reference)
   - Use Tailwind CSS classes (see `globals.css` for theme variables)
   - Make it a client component if it uses hooks (`'use client'`)

2. **Follow Design System**:
   - Use theme variables: `bg-ai-card`, `text-ai-text`, `text-ai-muted`, `border-gray-700`
   - Use Lucide React icons (already installed)
   - Follow spacing patterns (p-6, gap-6, space-y-8)
   - Use existing UI components from `components/ui/` when possible

3. **Add to Dashboard** (`components/analysis-dashboard.tsx`):
   - Import the new component
   - Add it in appropriate section
   - Pass required props from `result` or `stock`

4. **Handle Edge Cases**:
   - What if data is missing? (Show placeholder or skip rendering)
   - What if data is malformed? (Graceful degradation)
   - What if component errors? (Error boundary or null check)

**Example Pattern**:
```typescript
'use client';

import { AnalysisResult, StockData } from '@/lib/domain/AnalysisTypes';

interface YourComponentProps {
  result: AnalysisResult;
  stock: StockData;
}

export function YourComponent({ result, stock }: YourComponentProps) {
  if (!result?.someField) return null; // Handle missing data
  
  return (
    <div className="bg-ai-card border border-gray-700 rounded-lg p-6">
      {/* Your component JSX */}
    </div>
  );
}
```

---

### Task: Modify Analysis Heuristics

**Context**: Update the classification logic (e.g., change P/E thresholds, add new technical indicators)

**Steps**:
1. **Locate Function** (`lib/domain/auroraEngine.ts`):
   - Find the relevant function (e.g., `classifyFundamentals`, `analyzeTechnicals`)
   - Understand current logic and thresholds

2. **Update Logic**:
   - Modify thresholds or add new conditions
   - Keep function pure (no side effects)
   - Add comments explaining the rationale
   - Consider edge cases (missing data, extreme values)

3. **Update Tests** (if tests exist):
   - Update test cases to reflect new thresholds
   - Add tests for edge cases

4. **Verify Impact**:
   - Test with existing mock data
   - Check that classifications make sense
   - Ensure no breaking changes to UI

**Example Pattern**:
```typescript
function classifyFundamentals(stock: StockData): 'strong' | 'ok' | 'weak' | 'unknown' {
  const f = stock?.fundamentals;
  if (!f) return 'unknown';

  // Updated thresholds based on [rationale]
  const growth = f?.epsGrowthYoYPct ?? 0;
  const margin = f?.netMarginPct ?? 0;
  
  // Strong: [new criteria]
  if (growth > 20 && margin > 25) { // Updated from 15/20
    return 'strong';
  }
  
  // ... rest of logic
}
```

---

### Task: Add Export Functionality

**Context**: Add new export format (e.g., CSV, PDF, Excel)

**Steps**:
1. **Create Export Function** (`components/export-buttons.tsx` or new file):
   - Add button to UI
   - Implement export logic (use appropriate library)
   - Handle errors gracefully

2. **Format Data**:
   - Transform `AnalysisResult` to target format
   - Include all relevant fields
   - Format dates, numbers appropriately

3. **Add to UI**:
   - Add button next to existing export buttons
   - Use consistent styling
   - Show loading state during export

**Example Pattern**:
```typescript
const handleExportCSV = () => {
  const csv = convertToCSV(result);
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${result.ticker}-analysis.csv`;
  a.click();
};
```

---

## 🚨 Critical Rules

### 1. Domain Engine Purity
- **NEVER** add API calls, database queries, or side effects to `lib/domain/auroraEngine.ts`
- All functions must be pure (same input = same output)
- If you need external data, fetch it in the service layer and pass it in

### 2. Type Safety
- **ALWAYS** use TypeScript types from `AnalysisTypes.ts`
- **NEVER** use `any` type
- **ALWAYS** handle optional fields with null checks

### 3. Financial Advice Prohibition
- **NEVER** use language like "You should buy/sell"
- **ALWAYS** use framework language: "Many investors with similar profiles..."
- **ALWAYS** include disclaimers
- **ALWAYS** emphasize uncertainty

### 4. Error Handling
- **ALWAYS** handle missing data gracefully (show placeholder, don't crash)
- **ALWAYS** provide user-friendly error messages
- **ALWAYS** log technical errors (but don't expose to users)

### 5. Data Flow
```
User Input → StockForm → page.tsx → marketDataService → StockData
                                                          ↓
AnalysisResult ← auroraEngine ← StockData + UserProfile
     ↓
AnalysisDashboard → UI Components
```

## 📚 Reference Files

- **Architecture**: See `ARCHITECTURE.md`
- **Module Boundaries**: See `MODULE_BOUNDARIES.md`
- **Contributing**: See `CONTRIBUTING.md`
- **Types**: `lib/domain/AnalysisTypes.ts`
- **Engine**: `lib/domain/auroraEngine.ts`
- **Service**: `lib/services/marketDataService.ts`

## 🔍 Code Search Patterns

When working on this codebase, use these search patterns:

- **Find all analysis functions**: Search for `function analyze` in `auroraEngine.ts`
- **Find all type definitions**: Search in `AnalysisTypes.ts`
- **Find UI components**: Search in `components/` directory
- **Find data fetching**: Search for `fetchStockData` or `marketDataService`
- **Find error handling**: Search for `catch` or `error` in `page.tsx` and components

## ✅ Checklist Before Submitting Changes

- [ ] Code follows TypeScript best practices (no `any`, proper types)
- [ ] No side effects in domain engine
- [ ] Error handling is graceful and user-friendly
- [ ] UI follows design system (theme variables, spacing)
- [ ] No financial advice language (framework language only)
- [ ] All new types exported from `AnalysisTypes.ts`
- [ ] Comments explain complex logic
- [ ] No hardcoded values (use constants or config)
- [ ] Handles missing/optional data gracefully

## 🆘 Need Help?

If you're stuck:
1. Review existing similar code in the codebase
2. Check `ARCHITECTURE.md` for system design
3. Check `MODULE_BOUNDARIES.md` for where code should live
4. Review `CONTRIBUTING.md` for patterns

---

**Last Updated**: 2024
**Maintained By**: AuroraInvest Team

