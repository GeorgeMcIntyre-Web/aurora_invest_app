# 🏗️ AuroraInvest Stock Analyzer - Architecture Documentation

This document provides a comprehensive overview of the system architecture, data flows, and design decisions.

## 📐 System Overview

AuroraInvest is a **Next.js 14** application built with **TypeScript** and **React 18**. It follows a **layered architecture** with clear separation between:

1. **Presentation Layer** (UI Components)
2. **Application Layer** (Page orchestration)
3. **Domain Layer** (Pure business logic)
4. **Service Layer** (Data abstraction)
5. **Data Layer** (Mock/Real data sources)

## 🎯 Core Principles

### 1. Domain-Driven Design
- **Pure Domain Engine**: `lib/domain/auroraEngine.ts` contains all business logic
- **No Side Effects**: Domain functions are pure (deterministic, no I/O)
- **Type Safety**: All domain concepts are typed in `AnalysisTypes.ts`

### 2. Separation of Concerns
- **UI Components**: Only handle presentation and user interaction
- **Domain Engine**: Only contains business logic (no React, no API calls)
- **Service Layer**: Handles all external data fetching
- **Data Layer**: Provides data (mock or real)

### 3. Educational Focus
- **Framework Language**: All guidance uses "many investors..." not "you should..."
- **Uncertainty Emphasis**: All projections include uncertainty disclaimers
- **No Personalization**: No personalized financial advice

## 📁 Directory Structure

```
nextjs_space/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Main entry point (orchestrates form + dashboard)
│   ├── layout.tsx                # Root layout (metadata, HTML structure)
│   └── globals.css               # Global styles and theme variables
│
├── components/                   # React UI Components
│   ├── stock-form.tsx            # User input form (ticker + profile)
│   ├── analysis-dashboard.tsx   # Main results display (orchestrates cards)
│   ├── fundamentals-card.tsx     # Fundamentals analysis display
│   ├── technicals-card.tsx       # Technical analysis display
│   ├── sentiment-card.tsx        # Sentiment analysis display
│   ├── scenario-cards.tsx        # Scenario projections display
│   ├── export-buttons.tsx       # Export functionality (JSON, print)
│   └── ui/                       # Reusable UI primitives (shadcn/ui)
│
├── lib/
│   ├── domain/                   # Domain Layer (Pure Business Logic)
│   │   ├── AnalysisTypes.ts      # All domain types and interfaces
│   │   └── auroraEngine.ts       # Core analysis engine (PURE, NO SIDE EFFECTS)
│   │
│   ├── services/                 # Service Layer (Data Abstraction)
│   │   └── marketDataService.ts  # Market data fetching interface + implementations
│   │
│   └── data/                     # Data Layer
│       └── mockData.ts           # Mock stock data for development
│
└── public/                       # Static assets
    ├── favicon.svg
    └── og-image.png
```

## 🔄 Data Flow

### Analysis Request Flow

```
1. User Input
   └─> StockForm component
       ├─> User enters ticker (e.g., "AAPL")
       ├─> User selects risk tolerance, horizon, objective
       └─> Calls onAnalyze(ticker, profile)

2. Page Orchestration (app/page.tsx)
   └─> handleAnalyze(ticker, profile)
       ├─> Calls marketDataService.fetchStockData(ticker)
       │   └─> Returns StockData (from mock or real API)
       │
       └─> Calls analyzeStock(profile, stockData)
           └─> Returns AnalysisResult

3. Domain Engine (lib/domain/auroraEngine.ts)
   └─> analyzeStock(user, stock, opts?)
       ├─> classifyFundamentals(stock) → 'strong' | 'ok' | 'weak'
       ├─> classifyValuation(stock) → 'cheap' | 'fair' | 'rich'
       ├─> analyzeTechnicals(stock) → { trend, momentum, pricePosition }
       ├─> analyzeSentiment(stock) → { consensusText, targetVsPrice, newsHighlight }
       ├─> generateScenarios(user, stock) → ScenarioSummary
       ├─> generatePlanningGuidance(user, stock) → PlanningGuidance
       ├─> generateSummary(...) → AnalysisSummary
       └─> Compose views (fundamentalsView, valuationView, etc.)

4. UI Display (components/analysis-dashboard.tsx)
   └─> Receives AnalysisResult + StockData
       ├─> Displays summary (risk score, conviction, key takeaways)
       ├─> Renders FundamentalsCard
       ├─> Renders TechnicalsCard
       ├─> Renders SentimentCard
       ├─> Renders ScenarioCards
       └─> Displays PlanningGuidance + Disclaimer
```

## 🧩 Module Details

### Domain Layer (`lib/domain/`)

#### `AnalysisTypes.ts`
**Purpose**: Central type definitions for the entire domain.

**Key Types**:
- `UserProfile`: Risk tolerance, investment horizon, objective
- `StockData`: Complete stock information (fundamentals, technicals, sentiment)
- `AnalysisResult`: Complete analysis output
- `ScenarioSummary`: Bull/Base/Bear projections
- `PlanningGuidance`: Framework-based guidance

**Rules**:
- All domain types must be defined here
- Types should be exported for use across layers
- No implementation logic, only type definitions

#### `auroraEngine.ts`
**Purpose**: Pure analysis engine - all business logic lives here.

**Key Functions**:
- `analyzeStock(user, stock, opts?)`: Main entry point
- `classifyFundamentals(stock)`: Classifies fundamentals strength
- `classifyValuation(stock)`: Classifies valuation (cheap/fair/rich)
- `analyzeTechnicals(stock)`: Technical analysis (trend, momentum)
- `analyzeSentiment(stock)`: Sentiment analysis (analyst consensus, news)
- `generateScenarios(user, stock)`: Creates Bull/Base/Bear scenarios
- `generatePlanningGuidance(user, stock)`: Framework-based guidance
- `generateSummary(...)`: Creates analysis summary

**Critical Constraints**:
- **NO side effects**: No API calls, no database queries, no file I/O
- **Pure functions**: Same input always produces same output
- **Deterministic**: No random numbers, no time-dependent logic (except timestamps)
- **No React**: No React hooks, no JSX, no component logic

### Service Layer (`lib/services/`)

#### `marketDataService.ts`
**Purpose**: Abstraction layer for market data fetching.

**Interface**:
```typescript
export interface MarketDataService {
  fetchStockData(ticker: string): Promise<StockData>;
}
```

**Implementations**:
- `MockMarketDataService`: Returns mock data (current default)
- `RealMarketDataService`: (Future) Fetches from real API

**Factory Pattern**:
```typescript
export function createMarketDataService(): MarketDataService {
  // Can branch on environment variable
  return new MockMarketDataService();
}
```

**Rules**:
- All data fetching must go through this interface
- Service implementations map external data to `StockData` interface
- Error handling should be user-friendly
- Rate limiting and retries should be handled here

### Presentation Layer (`components/`)

#### Component Hierarchy

```
AnalysisDashboard (orchestrator)
├── Summary Section (risk score, conviction, key takeaways)
├── FundamentalsCard
│   └── FundamentalsChart (if applicable)
├── TechnicalsCard
│   └── TechnicalsChart (if applicable)
├── SentimentCard
├── ScenarioCards
│   └── ScenarioChart (if applicable)
├── PlanningGuidance Section
└── ExportButtons
```

#### Component Patterns

**Card Components**:
- Receive `result: AnalysisResult` and/or `stock: StockData`
- Handle missing data gracefully (return `null` if required data missing)
- Use theme variables for styling
- Follow consistent spacing and layout patterns

**Form Components**:
- Use controlled inputs (React state)
- Validate input before submission
- Show inline validation errors
- Disable during loading states

### Application Layer (`app/`)

#### `page.tsx`
**Purpose**: Main application entry point and orchestration.

**Responsibilities**:
- Manage application state (loading, error, result)
- Coordinate between form and dashboard
- Handle errors and map to user-friendly messages
- Orchestrate data fetching and analysis

**State Management**:
- Uses React `useState` hooks (no external state library needed for MVP)
- State includes: `isLoading`, `error`, `result`, `stock`

## 🎨 Design System

### Theme Variables (in `globals.css`)

```css
--ai-bg: #0a0a0a          /* Background */
--ai-card: #1a1a1a        /* Card background */
--ai-text: #ffffff        /* Primary text */
--ai-muted: #a0a0a0      /* Muted text */
--ai-primary: #3b82f6     /* Primary accent (blue) */
--ai-accent: #8b5cf6      /* Secondary accent (purple) */
```

### Styling Patterns

- **Cards**: `bg-ai-card border border-gray-700 rounded-lg p-6`
- **Text**: `text-ai-text` (primary), `text-ai-muted` (secondary)
- **Spacing**: Consistent use of `gap-6`, `space-y-8`, `p-6`, `mb-4`
- **Icons**: Lucide React icons, consistent sizing (`h-6 w-6`)

## 🔌 Integration Points

### Adding Real Market Data API

**Current State**: Uses `MockMarketDataService`

**To Add Real API**:
1. Create new service class implementing `MarketDataService`
2. Map API response to `StockData` interface
3. Update `createMarketDataService()` to branch on environment variable
4. Add API key to environment variables
5. Handle errors (rate limits, invalid tickers, network failures)

**Example**:
```typescript
export class AlphaVantageService implements MarketDataService {
  async fetchStockData(ticker: string): Promise<StockData> {
    const response = await fetch(`https://www.alphavantage.co/query?...`);
    const data = await response.json();
    return mapAlphaVantageToStockData(data); // Map to StockData interface
  }
}
```

### Adding New Analysis Dimensions

**Process**:
1. Add new fields to `StockData` interface (if needed)
2. Add new fields to `AnalysisResult` interface
3. Create analysis function in `auroraEngine.ts` (pure function)
4. Add to `analyzeStock` pipeline
5. Create view composer function
6. Create UI component to display new dimension
7. Add component to `AnalysisDashboard`

## 🧪 Testing Strategy

### Unit Tests (Future)
- **Domain Engine**: Test all analysis functions with known inputs
- **Service Layer**: Mock API responses, test error handling
- **Components**: Test rendering with different data states

### Integration Tests (Future)
- **End-to-End**: Test full analysis flow from form submission to result display
- **Error Scenarios**: Test error handling at each layer

## 🚀 Performance Considerations

### Current Optimizations
- **Client-Side Rendering**: Analysis happens in browser (fast for mock data)
- **No Database**: Currently no persistence layer (stateless)

### Future Optimizations
- **Caching**: Cache analysis results for same ticker/profile
- **API Rate Limiting**: Implement client-side rate limiting
- **Code Splitting**: Lazy load heavy components (charts)
- **Server-Side Analysis**: Move analysis to API route for real data

## 🔒 Security Considerations

### Current State
- **No Authentication**: Public application
- **No User Data**: No personal information stored
- **No API Keys in Client**: (Future) API keys must be server-side only

### Future Security
- **API Keys**: Must be in server-side environment variables
- **Rate Limiting**: Implement on both client and server
- **Input Validation**: Validate ticker format before API calls
- **XSS Prevention**: React automatically escapes, but be careful with user input

## 📊 Scalability Considerations

### Current Limitations
- **Single Stock Analysis**: Only analyzes one stock at a time
- **No History**: No saved analyses
- **No Comparison**: Cannot compare multiple stocks

### Future Scalability
- **Portfolio Analysis**: Extend to multiple stocks
- **User Accounts**: Save analyses, preferences
- **Batch Processing**: Analyze multiple stocks in parallel
- **Server-Side Processing**: Move heavy analysis to API routes

## 🔄 State Management

### Current Approach
- **React Hooks**: `useState` for local component state
- **Props Drilling**: Data flows through props (acceptable for MVP)

### Future Considerations
- **Context API**: If state needs to be shared across many components
- **State Library**: Consider Zustand or Jotai if state becomes complex
- **Server State**: Consider React Query or SWR for API data caching

## 📝 Code Organization Principles

1. **Single Responsibility**: Each module has one clear purpose
2. **Dependency Inversion**: High-level modules don't depend on low-level modules
3. **Open/Closed**: Open for extension, closed for modification
4. **Interface Segregation**: Small, focused interfaces
5. **Pure Functions**: Domain logic is pure and testable

---

**Last Updated**: 2024
**Maintained By**: AuroraInvest Team

