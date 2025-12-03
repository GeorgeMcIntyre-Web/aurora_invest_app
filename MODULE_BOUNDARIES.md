# 🚧 Module Boundaries & Separation of Concerns

This document defines clear boundaries between modules to ensure agents can work independently without conflicts.

## 📦 Module Map

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│  components/                                                  │
│  ├── stock-form.tsx          [FORM INPUT]                    │
│  ├── analysis-dashboard.tsx  [RESULTS ORCHESTRATOR]          │
│  ├── fundamentals-card.tsx    [FUNDAMENTALS DISPLAY]          │
│  ├── technicals-card.tsx     [TECHNICALS DISPLAY]            │
│  ├── sentiment-card.tsx      [SENTIMENT DISPLAY]              │
│  ├── scenario-cards.tsx      [SCENARIOS DISPLAY]             │
│  └── export-buttons.tsx      [EXPORT FUNCTIONALITY]           │
└─────────────────────────────────────────────────────────────┘
                            ↓ (props)
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                         │
│  app/page.tsx                                                │
│  ├── State Management (useState)                            │
│  ├── Orchestration (handleAnalyze)                          │
│  └── Error Handling                                          │
└─────────────────────────────────────────────────────────────┘
                            ↓ (calls)
┌─────────────────────────────────────────────────────────────┐
│                      DOMAIN LAYER                            │
│  lib/domain/                                                 │
│  ├── AnalysisTypes.ts        [TYPE DEFINITIONS ONLY]         │
│  └── auroraEngine.ts         [PURE BUSINESS LOGIC]           │
│      ├── classifyFundamentals()                              │
│      ├── classifyValuation()                                 │
│      ├── analyzeTechnicals()                                 │
│      ├── analyzeSentiment()                                  │
│      ├── generateScenarios()                                 │
│      ├── generatePlanningGuidance()                          │
│      └── analyzeStock() [ORCHESTRATOR]                       │
└─────────────────────────────────────────────────────────────┘
                            ↑ (receives)
┌─────────────────────────────────────────────────────────────┐
│                      SERVICE LAYER                           │
│  lib/services/                                               │
│  └── marketDataService.ts                                    │
│      ├── MarketDataService [INTERFACE]                       │
│      ├── MockMarketDataService [IMPLEMENTATION]             │
│      └── createMarketDataService() [FACTORY]                 │
└─────────────────────────────────────────────────────────────┘
                            ↑ (uses)
┌─────────────────────────────────────────────────────────────┐
│                       DATA LAYER                             │
│  lib/data/                                                   │
│  └── mockData.ts            [STATIC MOCK DATA]               │
└─────────────────────────────────────────────────────────────┘
```

## 🚫 What Each Module CANNOT Do

### Presentation Layer (`components/`)
❌ **CANNOT**:
- Make API calls directly
- Contain business logic (classification, calculation)
- Access external services
- Mutate domain objects
- Import from `lib/domain/auroraEngine.ts` (only types)

✅ **CAN**:
- Display data from props
- Handle user interactions (clicks, form submissions)
- Manage local UI state (loading, validation)
- Call callbacks passed as props
- Import types from `lib/domain/AnalysisTypes.ts`

### Application Layer (`app/page.tsx`)
❌ **CANNOT**:
- Contain business logic (analysis calculations)
- Make direct API calls (must use service layer)
- Access database directly
- Contain complex UI rendering logic

✅ **CAN**:
- Orchestrate between components
- Manage application-level state
- Call service layer for data
- Call domain engine for analysis
- Handle errors and map to user messages

### Domain Layer (`lib/domain/`)
❌ **CANNOT**:
- Make API calls
- Access database
- Use React hooks or components
- Have side effects (console.log is OK for debugging)
- Depend on external libraries (except TypeScript types)
- Access browser APIs (localStorage, fetch, etc.)

✅ **CAN**:
- Perform pure calculations
- Classify and analyze data
- Generate scenarios and guidance
- Transform data structures
- Import types from `AnalysisTypes.ts`

### Service Layer (`lib/services/`)
❌ **CANNOT**:
- Contain business logic (analysis, classification)
- Access UI components
- Depend on React
- Make assumptions about data structure (must map to domain types)

✅ **CAN**:
- Make API calls
- Fetch data from external sources
- Map external data to domain types (`StockData`)
- Handle network errors
- Implement retry logic
- Cache responses (future)

### Data Layer (`lib/data/`)
❌ **CANNOT**:
- Contain business logic
- Make API calls
- Depend on services

✅ **CAN**:
- Provide static mock data
- Export data in domain format (`StockData`)
- Be replaced by service layer for real data

## 🔗 Allowed Dependencies

### Dependency Graph

```
components/
  └─> lib/domain/AnalysisTypes.ts (types only)
  └─> app/page.tsx (via props)

app/page.tsx
  └─> components/ (imports)
  └─> lib/domain/AnalysisTypes.ts (types)
  └─> lib/domain/auroraEngine.ts (analyzeStock function)
  └─> lib/services/marketDataService.ts (fetchStockData)

lib/domain/auroraEngine.ts
  └─> lib/domain/AnalysisTypes.ts (types only)

lib/services/marketDataService.ts
  └─> lib/domain/AnalysisTypes.ts (StockData type)
  └─> lib/data/mockData.ts (for mock implementation)

lib/data/mockData.ts
  └─> lib/domain/AnalysisTypes.ts (StockData type)
```

### Import Rules

1. **Components** can only import:
   - Types from `lib/domain/AnalysisTypes.ts`
   - Other components
   - UI primitives from `components/ui/`

2. **Domain Engine** can only import:
   - Types from `lib/domain/AnalysisTypes.ts`
   - Standard TypeScript/JavaScript (no React, no external APIs)

3. **Service Layer** can import:
   - Types from `lib/domain/AnalysisTypes.ts`
   - Data from `lib/data/` (for mock implementation)
   - External libraries for API calls (fetch, axios, etc.)

4. **Application Layer** can import:
   - Everything (it's the orchestrator)

## 🎯 Agent Work Assignment Guidelines

### Working on UI Components
**Agent can work independently on**:
- `components/fundamentals-card.tsx`
- `components/technicals-card.tsx`
- `components/sentiment-card.tsx`
- `components/scenario-cards.tsx`
- `components/export-buttons.tsx`

**Boundaries**:
- Only receives props (`result: AnalysisResult`, `stock: StockData`)
- Cannot modify domain types
- Cannot change analysis logic
- Can improve styling, layout, accessibility

### Working on Domain Engine
**Agent can work independently on**:
- `lib/domain/auroraEngine.ts` (individual analysis functions)
- `lib/domain/AnalysisTypes.ts` (adding new types)

**Boundaries**:
- Must keep functions pure (no side effects)
- Cannot add React dependencies
- Cannot make API calls
- Must maintain existing function signatures (or coordinate changes)

### Working on Service Layer
**Agent can work independently on**:
- `lib/services/marketDataService.ts` (new implementations)
- `lib/data/mockData.ts` (adding mock data)

**Boundaries**:
- Must implement `MarketDataService` interface
- Must return `StockData` type
- Cannot modify domain engine
- Cannot modify UI components

### Working on Application Layer
**Agent can work independently on**:
- `app/page.tsx` (error handling, state management, orchestration)

**Boundaries**:
- Cannot modify domain engine logic
- Cannot modify service implementations (but can use them)
- Can improve error messages
- Can add loading states, animations

## 🔄 Change Coordination

### When Multiple Agents Need to Coordinate

**Scenario 1: Adding New Analysis Dimension**
- **Agent A** (Domain): Adds analysis function to `auroraEngine.ts`
- **Agent B** (Types): Adds new types to `AnalysisTypes.ts`
- **Agent C** (UI): Creates new card component
- **Agent D** (Orchestration): Wires new component into dashboard

**Coordination**:
1. Agent B defines types first
2. Agent A implements analysis function
3. Agent C creates UI component
4. Agent D integrates everything

**Scenario 2: Integrating Real API**
- **Agent A** (Service): Creates new service implementation
- **Agent B** (Data): Updates mock data structure if needed
- **Agent C** (Application): Updates error handling for new API

**Coordination**:
1. Agent A defines service interface contract
2. Agent B ensures mock data matches real API structure
3. Agent C handles new error cases

## ✅ Validation Checklist

Before submitting changes, verify:

- [ ] No cross-boundary violations (see "What Each Module CANNOT Do")
- [ ] Dependencies follow allowed dependency graph
- [ ] Domain engine remains pure (no side effects)
- [ ] Types are defined in `AnalysisTypes.ts` (not inline)
- [ ] Service layer maps to domain types correctly
- [ ] UI components only receive props (no direct data fetching)

## 🚨 Common Violations to Avoid

1. **❌ Component making API call directly**
   ```typescript
   // WRONG
   const data = await fetch('/api/stock');
   ```
   **✅ Correct**: Pass data as props or call service in parent

2. **❌ Domain engine using React**
   ```typescript
   // WRONG
   import { useState } from 'react';
   ```
   **✅ Correct**: Domain engine is pure TypeScript

3. **❌ Service layer containing business logic**
   ```typescript
   // WRONG
   if (pe > 20) return 'expensive';
   ```
   **✅ Correct**: Service only fetches and maps data

4. **❌ Types defined inline in components**
   ```typescript
   // WRONG (in component file)
   interface StockData { ... }
   ```
   **✅ Correct**: Define in `AnalysisTypes.ts`, import where needed

---

**Last Updated**: 2024
**Maintained By**: AuroraInvest Team

