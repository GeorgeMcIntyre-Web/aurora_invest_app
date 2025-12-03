# 🤝 Contributing to AuroraInvest Stock Analyzer

This guide helps contributors (including AI agents) understand coding patterns, conventions, and best practices for this project.

## 📋 Table of Contents

- [Code Style](#code-style)
- [TypeScript Guidelines](#typescript-guidelines)
- [Component Patterns](#component-patterns)
- [Error Handling](#error-handling)
- [Testing Guidelines](#testing-guidelines)
- [Commit Messages](#commit-messages)

## 💻 Code Style

### General Principles

1. **Readability First**: Code should be self-documenting
2. **Consistency**: Follow existing patterns in the codebase
3. **Simplicity**: Prefer simple solutions over clever ones
4. **Type Safety**: Use TypeScript types everywhere

### Formatting

- **Indentation**: 2 spaces (not tabs)
- **Semicolons**: Use semicolons
- **Quotes**: Use single quotes for strings (unless escaping)
- **Line Length**: Keep lines under 100 characters when possible

### Naming Conventions

- **Files**: `kebab-case.tsx` (e.g., `stock-form.tsx`)
- **Components**: `PascalCase` (e.g., `StockForm`)
- **Functions**: `camelCase` (e.g., `analyzeStock`)
- **Types/Interfaces**: `PascalCase` (e.g., `StockData`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `MOCK_STOCK_DATA`)
- **Variables**: `camelCase` (e.g., `riskScore`)

## 📘 TypeScript Guidelines

### Type Definitions

**✅ DO**: Define types in `lib/domain/AnalysisTypes.ts`
```typescript
export interface StockData {
  ticker: string;
  name?: string;
  fundamentals: StockFundamentals;
}
```

**❌ DON'T**: Define types inline in components
```typescript
// WRONG
interface StockData { ... } // in component file
```

### Type Safety

**✅ DO**: Use proper types, handle optionals
```typescript
function analyzeStock(user: UserProfile, stock: StockData): AnalysisResult {
  if (!user || !stock) {
    throw new Error('Required parameters missing');
  }
  // ...
}
```

**❌ DON'T**: Use `any` type
```typescript
// WRONG
function process(data: any) { ... }
```

### Optional Chaining

**✅ DO**: Use optional chaining for optional fields
```typescript
const price = stock?.technicals?.price ?? 0;
```

**❌ DON'T**: Assume fields exist
```typescript
// WRONG
const price = stock.technicals.price; // May crash if undefined
```

## 🧩 Component Patterns

### Component Structure

**Standard Component Template**:
```typescript
'use client'; // If using hooks

import { ComponentProps } from '@/lib/domain/AnalysisTypes';

interface YourComponentProps {
  result: AnalysisResult;
  stock: StockData;
}

export function YourComponent({ result, stock }: YourComponentProps) {
  // Early returns for missing data
  if (!result?.summary) {
    return null;
  }

  return (
    <div className="bg-ai-card border border-gray-700 rounded-lg p-6">
      {/* Component JSX */}
    </div>
  );
}
```

### Props Interface

**✅ DO**: Define props interface at top of file
```typescript
interface ComponentProps {
  result: AnalysisResult;
  optionalField?: string;
}
```

**❌ DON'T**: Use inline types
```typescript
// WRONG
export function Component({ result }: { result: AnalysisResult }) { ... }
```

### Conditional Rendering

**✅ DO**: Use early returns for missing data
```typescript
if (!data) return null;
if (!data.requiredField) return <Placeholder />;
```

**❌ DON'T**: Nest conditionals deeply
```typescript
// WRONG
return (
  <div>
    {data && data.field && data.field.value && (
      <span>{data.field.value}</span>
    )}
  </div>
);
```

### Styling

**✅ DO**: Use theme variables
```typescript
className="bg-ai-card text-ai-text border-gray-700"
```

**❌ DON'T**: Use hardcoded colors
```typescript
// WRONG
className="bg-gray-800 text-white"
```

## ⚠️ Error Handling

### Error Patterns

**✅ DO**: Provide user-friendly error messages
```typescript
try {
  const data = await fetchStockData(ticker);
} catch (err) {
  const message = err instanceof Error ? err.message : 'Unknown error';
  if (message.includes('not found')) {
    setError('This ticker is not available. Try: AAPL, MSFT, TSLA, GOOGL, NVDA.');
  } else {
    setError('An error occurred while fetching stock data.');
  }
}
```

**❌ DON'T**: Expose technical errors to users
```typescript
// WRONG
setError(err.message); // May contain API keys, stack traces, etc.
```

### Null Safety

**✅ DO**: Handle missing data gracefully
```typescript
const price = stock?.technicals?.price ?? 0;
const name = stock?.name ?? stock?.ticker ?? 'Unknown';
```

**❌ DON'T**: Assume data exists
```typescript
// WRONG
const price = stock.technicals.price; // Crashes if undefined
```

## 🧪 Testing Guidelines

### Unit Tests (Future)

**Test Structure**:
```typescript
describe('classifyFundamentals', () => {
  it('should return "strong" for high growth and margins', () => {
    const stock: StockData = {
      ticker: 'TEST',
      fundamentals: {
        epsGrowthYoYPct: 20,
        netMarginPct: 25,
        freeCashFlowYieldPct: 4,
        roe: 25,
      },
      // ...
    };
    expect(classifyFundamentals(stock)).toBe('strong');
  });
});
```

### Test Coverage Goals

- **Domain Engine**: 100% coverage (all functions)
- **Service Layer**: Test error handling, data mapping
- **Components**: Test rendering with different data states

## 📝 Comments & Documentation

### Function Comments

**✅ DO**: Add JSDoc for complex functions
```typescript
/**
 * Classifies stock fundamentals as 'strong', 'ok', 'weak', or 'unknown'.
 * 
 * Criteria:
 * - Strong: growth > 15%, margin > 20%, FCF yield > 3%, ROE > 20%
 * - Weak: growth < 5%, margin < 10%
 * - OK: everything else
 * 
 * @param stock - Stock data with fundamentals
 * @returns Classification string
 */
function classifyFundamentals(stock: StockData): 'strong' | 'ok' | 'weak' | 'unknown' {
  // ...
}
```

**❌ DON'T**: Comment obvious code
```typescript
// WRONG
const price = stock.price; // Gets the price
```

### Inline Comments

**✅ DO**: Explain "why", not "what"
```typescript
// Use PEG ratio because it accounts for growth, unlike P/E alone
const peg = forwardPE / Math.max(growth, 1);
```

**❌ DON'T**: State the obvious
```typescript
// WRONG
const peg = forwardPE / growth; // Divides forwardPE by growth
```

## 🔒 Security Guidelines

### Environment Variables

**✅ DO**: Use environment variables for secrets
```typescript
const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
if (!apiKey) throw new Error('API key required');
```

**❌ DON'T**: Hardcode secrets
```typescript
// WRONG
const apiKey = 'sk-1234567890abcdef';
```

### Input Validation

**✅ DO**: Validate user input
```typescript
if (!ticker || ticker.trim().length === 0) {
  setError('Please enter a valid stock ticker');
  return;
}
```

**❌ DON'T**: Trust user input
```typescript
// WRONG
const data = await fetch(`/api/stock/${ticker}`); // No validation
```

## 🎨 UI/UX Guidelines

### Loading States

**✅ DO**: Show loading indicators
```typescript
{isLoading && (
  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-ai-primary" />
)}
```

### Error States

**✅ DO**: Show user-friendly error messages
```typescript
{error && (
  <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
    <p className="text-sm text-red-300">{error}</p>
  </div>
)}
```

### Empty States

**✅ DO**: Provide helpful empty states
```typescript
{!result && !isLoading && (
  <div className="text-center">
    <p>Enter a stock ticker to get started</p>
  </div>
)}
```

## 📦 Import Organization

**✅ DO**: Organize imports logically
```typescript
// 1. React/Next.js
import { useState } from 'react';

// 2. Third-party libraries
import { Sparkles } from 'lucide-react';

// 3. Internal components
import { StockForm } from '@/components/stock-form';

// 4. Types
import { UserProfile } from '@/lib/domain/AnalysisTypes';

// 5. Utilities/services
import { marketDataService } from '@/lib/services/marketDataService';
```

## 🚀 Performance Guidelines

### React Optimization

**✅ DO**: Use early returns to avoid unnecessary rendering
```typescript
if (!data) return null;
```

**✅ DO**: Memoize expensive calculations (future)
```typescript
const expensiveValue = useMemo(() => {
  return complexCalculation(data);
}, [data]);
```

### Code Splitting (Future)

**✅ DO**: Lazy load heavy components
```typescript
const HeavyChart = lazy(() => import('./heavy-chart'));
```

## 📋 Commit Messages

### Format

```
type(scope): short description

Longer description if needed
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting, no code change
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance tasks

### Examples

```
feat(analysis): add ESG score to analysis results

fix(ui): handle missing technical data gracefully

docs(agent): add agent guide for new analysis dimensions
```

## ✅ Pre-Submit Checklist

Before submitting changes:

- [ ] Code follows TypeScript best practices
- [ ] No `any` types used
- [ ] Error handling is user-friendly
- [ ] UI follows design system
- [ ] No hardcoded secrets
- [ ] Comments explain complex logic
- [ ] Handles missing data gracefully
- [ ] No cross-boundary violations (see `MODULE_BOUNDARIES.md`)
- [ ] Domain engine remains pure (no side effects)

---

**Last Updated**: 2024
**Maintained By**: AuroraInvest Team

