# 🎯 ACTIVE MANAGER FEATURE - AGENT TASKS

**Feature Branch**: `feature/active-manager`
**Target**: Implement portfolio-aware "Active Manager" recommendation engine

**BEFORE STARTING**: Read `agent-workflow/GLOBAL_RULES.md` in its entirety.

---

## 🔄 EXECUTION SEQUENCE

Agents MUST run in this order:
1. **Agent AM-1**: Domain Types & Contracts
2. **Agent AM-2**: Recommendation Engine (Pure Logic)
3. **Agent AM-3**: Recommendation Engine Tests
4. **Agent AM-4**: UI Integration
5. **Agent AM-5**: End-to-End Validation & Documentation

Between each agent:
```bash
git status
npm run build
npm test
git add .
git commit -m "feat(active-manager): [agent name] - [what was done]"
```

---

## 🤖 AGENT AM-1: DOMAIN TYPES & CONTRACTS

**Your task is to**: Extend domain types and ensure contract consistency.

### IMPLEMENTATION STEPS

#### Step 1: Update `lib/domain/AnalysisTypes.ts`

Add these exports (importing from contracts):
```typescript
// Active Manager types (re-exported for convenience)
export type {
  ActiveManagerTimeframe,
  ActiveManagerRecommendation,
  ActiveManagerInput,
  ActiveManagerConfig,
} from '../agent-workflow/contracts/ActiveManagerContracts';

export {
  DEFAULT_ACTIVE_MANAGER_CONFIG,
  ACTIVE_MANAGER_DISCLAIMER,
} from '../agent-workflow/contracts/ActiveManagerContracts';
```

**Location**: Bottom of file, in new "Active Manager" section with comment header.

#### Step 2: Verify Contract File

Check that `agent-workflow/contracts/ActiveManagerContracts.ts` exists and compiles.

Run:
```bash
npx tsc --noEmit agent-workflow/contracts/ActiveManagerContracts.ts
```

If errors occur, fix import paths or type references.

#### Step 3: Verify No Circular Dependencies

Run build:
```bash
npm run build
```

If circular dependency errors occur:
- Check import paths in ActiveManagerContracts.ts
- Ensure `@/` alias resolves correctly
- Fix by adjusting import statements

### EXIT CRITERIA

- [ ] `npm run build` passes with 0 TypeScript errors
- [ ] `agent-workflow/contracts/ActiveManagerContracts.ts` exports all required types
- [ ] `lib/domain/AnalysisTypes.ts` re-exports Active Manager types
- [ ] No circular dependencies between files
- [ ] All imports use correct paths (relative or alias)

### REALITY CHECKPOINT

Provide:
```markdown
## AM-1 REALITY CHECKPOINT

**Branch**: feature/active-manager
**Commit**: [first 7 chars of git rev-parse HEAD]

**Build Status**:
[paste npm run build output]

**Files Modified**:
- lib/domain/AnalysisTypes.ts (added Active Manager re-exports)
- agent-workflow/contracts/ActiveManagerContracts.ts (verified/fixed if needed)

**Exit Criteria Met**: [✅/❌] All 5 criteria verified
```

---

## 🤖 AGENT AM-2: RECOMMENDATION ENGINE (PURE LOGIC)

**Your task is to**: Implement the core Active Manager recommendation logic as pure functions.

### BEFORE YOU START

Read:
- `lib/domain/auroraEngine.ts` for pure function patterns
- `lib/domain/portfolioEngine.ts` for portfolio logic examples
- `agent-workflow/contracts/ActiveManagerContracts.ts` for type contracts

### IMPLEMENTATION STEPS

#### Step 1: Create `lib/domain/activeManagerEngine.ts`

This file will contain PURE functions only (no side effects, no API calls).

**Required Functions**:

##### 1. `determineTimeframe(analysisResult: AnalysisResult, userProfile: UserProfile): ActiveManagerTimeframe`

Logic:
- If user horizon is '1-3' → 'short_term'
- If user horizon is '5-10' → 'medium_term'
- If user horizon is '10+' → 'long_term'
- Consider analysis scenarios.horizonMonths if available

##### 2. `calculateConfidenceScore(analysisResult: AnalysisResult, userProfile: UserProfile, config: ActiveManagerConfig): number`

Logic:
- Base score starts at analysisResult.summary.convictionScore3m
- Adjust DOWN if:
  - riskScore > highRiskThreshold and userProfile.riskTolerance === 'low' (-20)
  - riskScore > moderateRiskThreshold and userProfile.riskTolerance === 'moderate' (-10)
- Adjust UP if:
  - riskScore < moderateRiskThreshold and userProfile.riskTolerance === 'high' (+10)
- Clamp result to 0-100 range
- Return integer (use Math.round)

##### 3. `determinePrimaryAction(...): PortfolioAction`

Signature:
```typescript
function determinePrimaryAction(
  analysisResult: AnalysisResult,
  userProfile: UserProfile,
  portfolioContext: ActiveManagerInput['portfolioContext'],
  confidenceScore: number,
  config: ActiveManagerConfig
): PortfolioAction
```

Logic (use guard clauses, NO else statements):
1. If no existing holding:
   - If confidenceScore >= highConvictionThreshold → 'buy'
   - If confidenceScore < lowConvictionThreshold → 'hold'
   - Otherwise → 'buy'

2. If existing holding:
   - If currentWeight >= trimThreshold → 'trim' or 'sell' (use 'sell' if weight >= 40)
   - If currentWeight <= minMeaningfulWeight and confidenceScore >= moderateConvictionThreshold → 'buy'
   - If confidenceScore < lowConvictionThreshold → 'trim'
   - Otherwise → 'hold'

##### 4. `generateRationale(...): string[]`

Signature:
```typescript
function generateRationale(
  analysisResult: AnalysisResult,
  userProfile: UserProfile,
  portfolioContext: ActiveManagerInput['portfolioContext'],
  primaryAction: PortfolioAction,
  confidenceScore: number,
  config: ActiveManagerConfig
): string[]
```

Logic:
- Return 3-6 rationale bullets
- Use framework language patterns from ActiveManagerContracts.ts
- Reference conviction score, risk level, portfolio context
- Examples:
  - "Framework conviction score of [X] suggests [action] aligns with similar profiles."
  - "Current position weight of [Y]% [exceeds/falls within] typical guardrails."
  - "Risk score of [Z] indicates [low/moderate/high] uncertainty for this timeframe."

##### 5. `generateRiskFlags(...): string[]`

Signature:
```typescript
function generateRiskFlags(
  analysisResult: AnalysisResult,
  userProfile: UserProfile,
  portfolioContext: ActiveManagerInput['portfolioContext'],
  config: ActiveManagerConfig
): string[]
```

Logic:
- Return 0-3 risk flags
- Add flag if:
  - riskScore >= highRiskThreshold → "High risk score indicates significant uncertainty"
  - currentWeight >= maxSinglePositionWeight → "Position exceeds typical concentration limits"
  - User risk tolerance is 'low' but riskScore >= moderateRiskThreshold → "Risk level may exceed profile tolerance"

##### 6. `generateHeadline(...): string`

Signature:
```typescript
function generateHeadline(
  primaryAction: PortfolioAction,
  confidenceScore: number,
  ticker: string
): string
```

Logic:
- Template: "[Action verb] [ticker] - [confidence descriptor]"
- Examples:
  - "Buy AAPL - High Confidence"
  - "Hold MSFT - Moderate Conviction"
  - "Trim TSLA - Elevated Risk"

##### 7. `generateRecommendation(input: ActiveManagerInput, config?: ActiveManagerConfig): ActiveManagerRecommendation`

This is the MAIN function that orchestrates all the above.

Logic:
```typescript
export function generateRecommendation(
  input: ActiveManagerInput,
  config: ActiveManagerConfig = DEFAULT_ACTIVE_MANAGER_CONFIG
): ActiveManagerRecommendation {
  const timeframe = determineTimeframe(input.analysisResult, input.userProfile);
  const confidenceScore = calculateConfidenceScore(
    input.analysisResult,
    input.userProfile,
    config
  );
  const primaryAction = determinePrimaryAction(
    input.analysisResult,
    input.userProfile,
    input.portfolioContext,
    confidenceScore,
    config
  );
  const rationale = generateRationale(
    input.analysisResult,
    input.userProfile,
    input.portfolioContext,
    primaryAction,
    confidenceScore,
    config
  );
  const riskFlags = generateRiskFlags(
    input.analysisResult,
    input.userProfile,
    input.portfolioContext,
    config
  );
  const headline = generateHeadline(primaryAction, confidenceScore, input.ticker);

  const notes: string[] = [];
  if (input.portfolioContext?.currentWeight && input.portfolioContext.currentWeight > config.maxSinglePositionWeight) {
    notes.push(`Position size adjusted to respect ${config.maxSinglePositionWeight}% concentration limit.`);
  }

  return {
    ticker: input.ticker,
    primaryAction,
    confidenceScore,
    headline,
    rationale,
    riskFlags,
    timeframe,
    notes: notes.length > 0 ? notes : undefined,
  };
}
```

#### Step 2: Coding Style Compliance

- Use guard clauses (early returns)
- NO `else` or `else if` statements
- Avoid nesting more than 2 levels
- Use `===` and `!==`
- Avoid unary `!` where possible (prefer explicit checks)
- Keep functions compact (< 50 lines each)

#### Step 3: Add JSDoc Comments

Each function needs a clear JSDoc comment explaining:
- Purpose
- Parameters
- Return value
- Example usage (optional but helpful)

### EXIT CRITERIA

- [ ] `lib/domain/activeManagerEngine.ts` exists and exports all 7 functions
- [ ] All functions are PURE (no side effects, no API calls, deterministic)
- [ ] `npm run build` passes with 0 TypeScript errors
- [ ] No `else` or `else if` statements used
- [ ] Guard clauses used throughout
- [ ] All property names match ActiveManagerContracts.ts exactly
- [ ] JSDoc comments present for all exported functions

### REALITY CHECKPOINT

Provide:
```markdown
## AM-2 REALITY CHECKPOINT

**Branch**: feature/active-manager
**Commit**: [first 7 chars of git rev-parse HEAD]

**Build Status**:
[paste npm run build output]

**Files Created**:
- lib/domain/activeManagerEngine.ts (7 functions, ~200-300 lines)

**Function Exports**:
- determineTimeframe
- calculateConfidenceScore
- determinePrimaryAction
- generateRationale
- generateRiskFlags
- generateHeadline
- generateRecommendation (main orchestrator)

**Style Compliance**:
- [✅/❌] No else/else if statements
- [✅/❌] Guard clauses used
- [✅/❌] All functions < 50 lines
- [✅/❌] All functions pure (no side effects)

**Exit Criteria Met**: [✅/❌] All 7 criteria verified
```

---

## 🤖 AGENT AM-3: RECOMMENDATION ENGINE TESTS

**Your task is to**: Write comprehensive unit tests for the Active Manager recommendation engine.

### BEFORE YOU START

Read:
- `agent-workflow/GLOBAL_RULES.md` section on testing
- `lib/domain/activeManagerEngine.ts` (completed by AM-2)
- Existing test patterns in repo (if any exist in `lib/domain/`)

### IMPLEMENTATION STEPS

#### Step 1: Create `lib/domain/activeManagerEngine.test.ts`

Import:
```typescript
import { describe, it, expect } from 'vitest';
import {
  generateRecommendation,
  determineTimeframe,
  calculateConfidenceScore,
  determinePrimaryAction,
  generateRiskFlags,
} from './activeManagerEngine';
import type {
  ActiveManagerInput,
  AnalysisResult,
  UserProfile,
} from './AnalysisTypes';
import { DEFAULT_ACTIVE_MANAGER_CONFIG } from './AnalysisTypes';
```

#### Step 2: Write Test Suites

**MINIMUM REQUIRED TESTS** (you may add more):

##### Test Suite 1: `determineTimeframe`

```typescript
describe('determineTimeframe', () => {
  it('should return short_term for 1-3 year horizon', () => {
    const mockAnalysis = { /* minimal AnalysisResult */ } as AnalysisResult;
    const mockProfile: UserProfile = {
      riskTolerance: 'moderate',
      horizon: '1-3',
      objective: 'growth',
    };

    const result = determineTimeframe(mockAnalysis, mockProfile);

    expect(result).toBe('short_term');
  });

  it('should return medium_term for 5-10 year horizon', () => {
    // Similar structure
  });

  it('should return long_term for 10+ year horizon', () => {
    // Similar structure
  });
});
```

##### Test Suite 2: `calculateConfidenceScore`

```typescript
describe('calculateConfidenceScore', () => {
  it('should return base conviction score when risk matches tolerance', () => {
    const mockAnalysis: AnalysisResult = {
      summary: { convictionScore3m: 75, riskScore: 5, /* ... */ },
      // ... other required fields
    } as AnalysisResult;

    const mockProfile: UserProfile = {
      riskTolerance: 'moderate',
      horizon: '5-10',
      objective: 'growth',
    };

    const result = calculateConfidenceScore(
      mockAnalysis,
      mockProfile,
      DEFAULT_ACTIVE_MANAGER_CONFIG
    );

    expect(result).toBeGreaterThanOrEqual(60);
    expect(result).toBeLessThanOrEqual(85);
  });

  it('should reduce confidence when high risk meets low tolerance', () => {
    const mockAnalysis: AnalysisResult = {
      summary: { convictionScore3m: 70, riskScore: 8, /* ... */ },
      // ... other required fields
    } as AnalysisResult;

    const mockProfile: UserProfile = {
      riskTolerance: 'low',
      horizon: '5-10',
      objective: 'balanced',
    };

    const result = calculateConfidenceScore(
      mockAnalysis,
      mockProfile,
      DEFAULT_ACTIVE_MANAGER_CONFIG
    );

    expect(result).toBeLessThan(70); // Should be reduced
  });

  it('should clamp confidence score to 0-100 range', () => {
    const mockAnalysis: AnalysisResult = {
      summary: { convictionScore3m: 95, riskScore: 2, /* ... */ },
      // ...
    } as AnalysisResult;

    const mockProfile: UserProfile = {
      riskTolerance: 'high',
      horizon: '5-10',
      objective: 'growth',
    };

    const result = calculateConfidenceScore(
      mockAnalysis,
      mockProfile,
      DEFAULT_ACTIVE_MANAGER_CONFIG
    );

    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(100);
  });
});
```

##### Test Suite 3: `determinePrimaryAction`

```typescript
describe('determinePrimaryAction', () => {
  it('should return buy for high confidence with no existing holding', () => {
    const mockAnalysis = { /* ... */ } as AnalysisResult;
    const mockProfile = { /* ... */ } as UserProfile;

    const result = determinePrimaryAction(
      mockAnalysis,
      mockProfile,
      undefined, // no portfolio context
      75, // high confidence
      DEFAULT_ACTIVE_MANAGER_CONFIG
    );

    expect(result).toBe('buy');
  });

  it('should return trim when position weight exceeds threshold', () => {
    const mockAnalysis = { /* ... */ } as AnalysisResult;
    const mockProfile = { /* ... */ } as UserProfile;
    const portfolioContext = {
      currentWeight: 26, // exceeds 25% threshold
    };

    const result = determinePrimaryAction(
      mockAnalysis,
      mockProfile,
      portfolioContext,
      60,
      DEFAULT_ACTIVE_MANAGER_CONFIG
    );

    expect(result).toBe('trim');
  });

  it('should return hold for moderate confidence with balanced position', () => {
    // Test hold logic
  });
});
```

##### Test Suite 4: `generateRiskFlags`

```typescript
describe('generateRiskFlags', () => {
  it('should return empty array when risk is low', () => {
    const mockAnalysis: AnalysisResult = {
      summary: { riskScore: 3, /* ... */ },
      // ...
    } as AnalysisResult;

    const mockProfile: UserProfile = {
      riskTolerance: 'moderate',
      horizon: '5-10',
      objective: 'growth',
    };

    const result = generateRiskFlags(
      mockAnalysis,
      mockProfile,
      undefined,
      DEFAULT_ACTIVE_MANAGER_CONFIG
    );

    expect(result).toHaveLength(0);
  });

  it('should flag high risk score', () => {
    const mockAnalysis: AnalysisResult = {
      summary: { riskScore: 8, /* ... */ },
      // ...
    } as AnalysisResult;

    const mockProfile: UserProfile = {
      riskTolerance: 'moderate',
      horizon: '5-10',
      objective: 'growth',
    };

    const result = generateRiskFlags(
      mockAnalysis,
      mockProfile,
      undefined,
      DEFAULT_ACTIVE_MANAGER_CONFIG
    );

    expect(result.length).toBeGreaterThan(0);
    expect(result.some(flag => flag.toLowerCase().includes('risk'))).toBe(true);
  });

  it('should flag concentration risk', () => {
    const mockAnalysis: AnalysisResult = {
      summary: { riskScore: 5, /* ... */ },
      // ...
    } as AnalysisResult;

    const mockProfile: UserProfile = {
      riskTolerance: 'moderate',
      horizon: '5-10',
      objective: 'growth',
    };

    const portfolioContext = {
      currentWeight: 30, // exceeds max
    };

    const result = generateRiskFlags(
      mockAnalysis,
      mockProfile,
      portfolioContext,
      DEFAULT_ACTIVE_MANAGER_CONFIG
    );

    expect(result.length).toBeGreaterThan(0);
    expect(result.some(flag => flag.toLowerCase().includes('concentration'))).toBe(true);
  });
});
```

##### Test Suite 5: `generateRecommendation` (Integration)

```typescript
describe('generateRecommendation', () => {
  it('should generate complete recommendation for new position', () => {
    const input: ActiveManagerInput = {
      ticker: 'AAPL',
      analysisResult: {
        ticker: 'AAPL',
        summary: {
          convictionScore3m: 75,
          riskScore: 5,
          headlineView: 'Strong fundamentals',
          keyTakeaways: [],
        },
        // ... minimal required fields
      } as AnalysisResult,
      userProfile: {
        riskTolerance: 'moderate',
        horizon: '5-10',
        objective: 'growth',
      },
    };

    const result = generateRecommendation(input);

    expect(result.ticker).toBe('AAPL');
    expect(result.primaryAction).toBeDefined();
    expect(result.confidenceScore).toBeGreaterThanOrEqual(0);
    expect(result.confidenceScore).toBeLessThanOrEqual(100);
    expect(result.headline).toContain('AAPL');
    expect(result.rationale).toBeInstanceOf(Array);
    expect(result.rationale.length).toBeGreaterThanOrEqual(3);
    expect(result.rationale.length).toBeLessThanOrEqual(6);
    expect(result.riskFlags).toBeInstanceOf(Array);
    expect(result.timeframe).toMatch(/^(short_term|medium_term|long_term)$/);
  });

  it('should generate trim recommendation for oversized position', () => {
    const input: ActiveManagerInput = {
      ticker: 'TSLA',
      analysisResult: {
        ticker: 'TSLA',
        summary: {
          convictionScore3m: 60,
          riskScore: 7,
          headlineView: 'Elevated volatility',
          keyTakeaways: [],
        },
        // ... minimal required fields
      } as AnalysisResult,
      userProfile: {
        riskTolerance: 'moderate',
        horizon: '5-10',
        objective: 'growth',
      },
      portfolioContext: {
        currentWeight: 28, // oversized
      },
    };

    const result = generateRecommendation(input);

    expect(result.primaryAction).toMatch(/^(trim|sell)$/);
    expect(result.notes).toBeDefined();
    expect(result.notes!.some(note => note.includes('concentration'))).toBe(true);
  });
});
```

#### Step 3: Ensure Test Quality

Each test MUST:
- Have a clear `describe` block
- Have at least one `it` block
- Have at least one `expect` assertion
- Test a specific behavior
- Use realistic mock data

#### Step 4: Run Tests

```bash
npx vitest run lib/domain/activeManagerEngine.test.ts
```

Verify:
- All tests pass
- No "No test suite found" message
- Output shows "X tests passed" where X >= 10

### EXIT CRITERIA

- [ ] `lib/domain/activeManagerEngine.test.ts` exists
- [ ] File contains at least 5 `describe` blocks (one per major function)
- [ ] File contains at least 10 `it` blocks with real assertions
- [ ] `npx vitest run lib/domain/activeManagerEngine.test.ts` shows all tests passing
- [ ] No skipped tests (or skipped tests documented with TODO)
- [ ] `npm run build` still passes with 0 errors
- [ ] All tests use realistic mock data (not just empty objects)

### REALITY CHECKPOINT

Provide:
```markdown
## AM-3 REALITY CHECKPOINT

**Branch**: feature/active-manager
**Commit**: [first 7 chars of git rev-parse HEAD]

**Build Status**:
[paste npm run build output]

**Test Status**:
[paste npx vitest run lib/domain/activeManagerEngine.test.ts output]

**Test Coverage**:
- determineTimeframe: [X] tests
- calculateConfidenceScore: [X] tests
- determinePrimaryAction: [X] tests
- generateRiskFlags: [X] tests
- generateRecommendation: [X] tests
- Total: [X] tests passed

**Exit Criteria Met**: [✅/❌] All 7 criteria verified
```

---

## 🤖 AGENT AM-4: UI INTEGRATION

**Your task is to**: Integrate Active Manager into the analysis dashboard UI.

### BEFORE YOU START

Read:
- `components/analysis-dashboard.tsx` to understand current structure
- `app/page.tsx` to see how analysis is triggered
- Existing card components for styling patterns

### IMPLEMENTATION STEPS

#### Step 1: Create Active Manager Card Component

Create `components/active-manager-card.tsx`:

```typescript
'use client';

import type { ActiveManagerRecommendation } from '@/lib/domain/AnalysisTypes';
import { ACTIVE_MANAGER_DISCLAIMER } from '@/lib/domain/AnalysisTypes';
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react';

interface ActiveManagerCardProps {
  recommendation: ActiveManagerRecommendation;
}

export function ActiveManagerCard({ recommendation }: ActiveManagerCardProps) {
  if (!recommendation) {
    return null;
  }

  // Action icon mapping
  const getActionIcon = () => {
    if (recommendation.primaryAction === 'buy') {
      return <TrendingUp className="w-5 h-5 text-green-400" />;
    }
    if (recommendation.primaryAction === 'sell') {
      return <TrendingDown className="w-5 h-5 text-red-400" />;
    }
    if (recommendation.primaryAction === 'trim') {
      return <TrendingDown className="w-5 h-5 text-yellow-400" />;
    }
    return <Minus className="w-5 h-5 text-gray-400" />;
  };

  // Confidence color
  const getConfidenceColor = () => {
    if (recommendation.confidenceScore >= 70) {
      return 'text-green-400';
    }
    if (recommendation.confidenceScore >= 40) {
      return 'text-yellow-400';
    }
    return 'text-gray-400';
  };

  return (
    <div className="bg-ai-card border border-gray-700 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        {getActionIcon()}
        <div>
          <h3 className="text-lg font-semibold text-ai-text">
            Active Manager Recommendation
          </h3>
          <p className="text-sm text-ai-muted">{recommendation.timeframe.replace('_', ' ')}</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Headline */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <p className="text-base font-medium text-ai-text">
            {recommendation.headline}
          </p>
        </div>

        {/* Confidence */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-ai-muted">Confidence Score</span>
          <span className={`text-lg font-semibold ${getConfidenceColor()}`}>
            {recommendation.confidenceScore}/100
          </span>
        </div>

        {/* Rationale */}
        <div>
          <h4 className="text-sm font-semibold text-ai-text mb-2">Rationale</h4>
          <ul className="space-y-2">
            {recommendation.rationale.map((item, idx) => (
              <li key={idx} className="text-sm text-ai-muted flex gap-2">
                <span className="text-ai-accent">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Risk Flags */}
        {recommendation.riskFlags.length > 0 && (
          <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
              <h4 className="text-sm font-semibold text-yellow-400">Risk Considerations</h4>
            </div>
            <ul className="space-y-1">
              {recommendation.riskFlags.map((flag, idx) => (
                <li key={idx} className="text-sm text-yellow-200/80">
                  {flag}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Notes */}
        {recommendation.notes && recommendation.notes.length > 0 && (
          <div className="text-xs text-ai-muted space-y-1">
            {recommendation.notes.map((note, idx) => (
              <p key={idx}>{note}</p>
            ))}
          </div>
        )}

        {/* Disclaimer */}
        <div className="text-xs text-ai-muted pt-4 border-t border-gray-700">
          {ACTIVE_MANAGER_DISCLAIMER}
        </div>
      </div>
    </div>
  );
}
```

**Style Requirements**:
- Use guard clause for null check (return null if !recommendation)
- NO else statements for icon/color logic
- Use existing theme classes: `bg-ai-card`, `text-ai-text`, `text-ai-muted`, `border-gray-700`
- Follow existing card patterns from the dashboard

#### Step 2: Update Analysis Dashboard

Modify `components/analysis-dashboard.tsx`:

1. Import the new card:
```typescript
import { ActiveManagerCard } from './active-manager-card';
```

2. Import Active Manager engine:
```typescript
import { generateRecommendation } from '@/lib/domain/activeManagerEngine';
import type { ActiveManagerInput } from '@/lib/domain/AnalysisTypes';
```

3. Generate recommendation inside component (or receive as prop):

Option A (generate inside dashboard):
```typescript
// Inside AnalysisDashboard component, after receiving result and stock props
const activeManagerInput: ActiveManagerInput = {
  ticker: result.ticker,
  analysisResult: result,
  userProfile: {
    riskTolerance: 'moderate', // TODO: Get from user settings
    horizon: '5-10',
    objective: 'growth',
  },
  // portfolioContext: undefined, // Add later when portfolio integration exists
};

const recommendation = generateRecommendation(activeManagerInput);
```

Option B (receive as prop, generated in page.tsx):
```typescript
interface AnalysisDashboardProps {
  result: AnalysisResult;
  stock: StockData;
  recommendation?: ActiveManagerRecommendation; // Add this
}
```

**Choose Option A for now** (simpler, self-contained).

4. Add card to dashboard layout:

Find the section where cards are rendered (likely in a grid), and add:
```typescript
<ActiveManagerCard recommendation={recommendation} />
```

Place it prominently (e.g., top of the dashboard or near summary).

#### Step 3: Verify UI Renders

```bash
npm run build
```

If build passes, manually test:
```bash
npm run dev
```

Navigate to app, run an analysis, verify:
- Active Manager card appears
- Recommendation displays correctly
- No console errors
- Styling matches existing cards

### EXIT CRITERIA

- [ ] `components/active-manager-card.tsx` exists
- [ ] Card component uses guard clauses (no else statements)
- [ ] `components/analysis-dashboard.tsx` imports and renders ActiveManagerCard
- [ ] `npm run build` passes with 0 TypeScript errors
- [ ] `npm run dev` runs without errors
- [ ] Active Manager card appears in UI when analysis is run
- [ ] Card styling matches existing design system

### REALITY CHECKPOINT

Provide:
```markdown
## AM-4 REALITY CHECKPOINT

**Branch**: feature/active-manager
**Commit**: [first 7 chars of git rev-parse HEAD]

**Build Status**:
[paste npm run build output]

**Dev Server**:
[paste npm run dev startup output, or note "Started successfully"]

**Files Modified**:
- components/active-manager-card.tsx (new component, ~150 lines)
- components/analysis-dashboard.tsx (added ActiveManagerCard integration)

**UI Verification**:
- [✅/❌] Card renders without errors
- [✅/❌] Recommendation data displays correctly
- [✅/❌] Styling matches existing cards
- [✅/❌] Disclaimer text appears

**Exit Criteria Met**: [✅/❌] All 7 criteria verified
```

---

## 🤖 AGENT AM-5: END-TO-END VALIDATION & DOCUMENTATION

**Your task is to**: Perform final validation, run all tests, and update documentation.

### IMPLEMENTATION STEPS

#### Step 1: Full Build Verification

```bash
npm run build
```

Expected: 0 TypeScript errors

If errors occur:
- Fix type mismatches
- Fix import paths
- Ensure all exports match imports

#### Step 2: Full Test Suite

```bash
npm test
```

Or:
```bash
npx vitest run
```

Expected output:
- All Active Manager tests pass
- No new test failures in existing tests
- Total test count increased by ~10+

If failures occur:
- Review test failures
- Fix implementation bugs
- Rerun until all pass

#### Step 3: Manual UI Validation

```bash
npm run dev
```

Test scenarios:
1. Analyze a stock (e.g., AAPL)
2. Verify Active Manager card appears
3. Check that recommendation makes sense
4. Verify disclaimer appears
5. Check for console errors (should be none)

#### Step 4: Update Documentation

##### Update `ARCHITECTURE.md` (if exists)

Add section:
```markdown
### Active Manager

**Location**: `lib/domain/activeManagerEngine.ts`

**Purpose**: Generates portfolio-aware, framework-based action recommendations.

**Key Functions**:
- `generateRecommendation()` - Main entry point
- Combines analysis results, user profile, and portfolio context
- Outputs structured recommendation with rationale and risk flags

**Contract**: See `agent-workflow/contracts/ActiveManagerContracts.ts`
```

##### Update `AGENT_GUIDE.md`

Add section at end:
```markdown
### Active Manager Feature

**Domain**: `lib/domain/activeManagerEngine.ts` (pure functions)
**UI**: `components/active-manager-card.tsx`
**Types**: `agent-workflow/contracts/ActiveManagerContracts.ts`

**How It Works**:
1. Takes `ActiveManagerInput` (analysis + user profile + optional portfolio context)
2. Calculates confidence score based on risk tolerance alignment
3. Determines primary action (buy/hold/trim/sell)
4. Generates rationale bullets using framework language
5. Flags concentration or risk mismatches
6. Returns `ActiveManagerRecommendation` struct

**Adding New Logic**:
- Update functions in `activeManagerEngine.ts`
- Keep functions pure (no side effects)
- Update tests in `activeManagerEngine.test.ts`
- Follow GLOBAL_RULES.md coding style

**Framework Language**:
- See `ActiveManagerContracts.ts` for approved patterns
- Never use direct advice ("you should buy")
- Always use framework language ("many investors with similar profiles...")
```

##### Create `agent-workflow/ACTIVE_MANAGER_COMPLETION_REPORT.md`

```markdown
# Active Manager Feature - Completion Report

**Feature Branch**: feature/active-manager
**Status**: ✅ COMPLETE
**Date**: [Current date]

## Implementation Summary

### Files Created
1. `agent-workflow/GLOBAL_RULES.md` - Global rules and countermeasures
2. `agent-workflow/contracts/ActiveManagerContracts.ts` - Type contracts
3. `lib/domain/activeManagerEngine.ts` - Pure recommendation logic (7 functions)
4. `lib/domain/activeManagerEngine.test.ts` - Unit tests (10+ tests)
5. `components/active-manager-card.tsx` - UI component

### Files Modified
1. `lib/domain/AnalysisTypes.ts` - Added Active Manager type re-exports
2. `components/analysis-dashboard.tsx` - Integrated ActiveManagerCard

## Build & Test Status

**Build**: ✅ PASS (0 errors)
**Tests**: ✅ PASS (X tests, 0 failures)

## Feature Capabilities

- ✅ Generates buy/hold/trim/sell recommendations
- ✅ Calculates confidence score (0-100)
- ✅ Provides 3-6 rationale bullets in framework language
- ✅ Flags concentration risk and risk tolerance mismatches
- ✅ Respects user profile (risk tolerance, horizon, objective)
- ✅ Considers portfolio context (position size, weight)
- ✅ Uses guard clauses, no else statements
- ✅ All functions are pure (deterministic, no side effects)

## Framework Language Compliance

All recommendations use framework language:
- "Many investors with similar profiles..."
- "Framework guardrails suggest..."
- "Typical concentration limits..."

NO direct advice language:
- ❌ "You should buy..."
- ❌ "This is a good investment..."

## Next Steps (Optional Enhancements)

- [ ] Add user settings UI for risk tolerance/horizon/objective
- [ ] Integrate with real portfolio data (currently uses mock context)
- [ ] Add more sophisticated confidence scoring logic
- [ ] Add backtest visualization for recommendations
- [ ] Export recommendation history

## Lessons Learned

- Guard clauses + no else statements → cleaner, more readable code
- Contract files prevent type drift between agents
- Test-first approach catches edge cases early
- Framework language patterns ensure compliance

---

**Feature Ready for Merge**: ✅ YES
**PR Title**: `feat(active-manager): Add portfolio-aware recommendation engine`
```

#### Step 5: Git Status Check

```bash
git status
```

Verify:
- All new files are tracked
- No unintended modifications
- Clean working directory

```bash
git add .
git commit -m "feat(active-manager): complete end-to-end validation and docs"
```

### EXIT CRITERIA

- [ ] `npm run build` passes with 0 errors
- [ ] `npm test` (or `npx vitest run`) shows all Active Manager tests passing
- [ ] Manual UI test confirms card renders correctly
- [ ] `ARCHITECTURE.md` or `AGENT_GUIDE.md` updated with Active Manager section
- [ ] `agent-workflow/ACTIVE_MANAGER_COMPLETION_REPORT.md` created
- [ ] All changes committed to `feature/active-manager` branch
- [ ] No console errors when running analysis in dev mode

### REALITY CHECKPOINT

Provide:
```markdown
## AM-5 REALITY CHECKPOINT

**Branch**: feature/active-manager
**Commit**: [first 7 chars of git rev-parse HEAD]

**Final Build Status**:
[paste npm run build output]

**Final Test Status**:
[paste npm test output]

**Manual UI Validation**:
- [✅/❌] Analyzed stock successfully
- [✅/❌] Active Manager card renders
- [✅/❌] Recommendation data correct
- [✅/❌] No console errors
- [✅/❌] Disclaimer visible

**Documentation Updated**:
- [✅/❌] AGENT_GUIDE.md
- [✅/❌] ARCHITECTURE.md (if exists)
- [✅/❌] ACTIVE_MANAGER_COMPLETION_REPORT.md

**Git Status**:
- [✅/❌] All changes committed
- [✅/❌] Clean working directory
- [✅/❌] Branch ready for PR

**Exit Criteria Met**: [✅/❌] All 7 criteria verified

---

## FEATURE COMPLETE ✅

Active Manager is ready for pull request review and merge to main.
```

---

## 📊 AGENT HANDOFF PROTOCOL

Between each agent:

1. **Current agent** completes their reality checkpoint
2. **Current agent** runs:
   ```bash
   git add .
   git commit -m "feat(active-manager): [agent-name] - [description]"
   git status
   npm run build
   npm test
   ```
3. **Current agent** posts summary:
   - What was implemented
   - What tests were added
   - Exit criteria status
   - Known issues (if any)
4. **Next agent** starts by:
   - Reading their task section above
   - Running `git status` and `npm run build` to verify starting state
   - Reading the previous agent's checkpoint

---

## 🚨 FAILURE RECOVERY

### If Build Fails:
1. Read error message carefully
2. Check import paths (use `@/` alias or relative paths correctly)
3. Check type definitions match usage
4. Check for circular dependencies
5. **DO NOT** blame TypeScript until you have minimal repro

### If Tests Fail:
1. Read test failure message
2. Check mock data matches real types
3. Verify function logic matches test expectations
4. Run single test file: `npx vitest run path/to/file.test.ts`
5. **DO NOT** skip tests - fix the issue

### If UI Doesn't Render:
1. Check browser console for errors
2. Verify component imports are correct
3. Check that props are passed correctly
4. Verify data structure matches component expectations
5. Add `console.log` to debug data flow

---

## ✅ SUCCESS CRITERIA (OVERALL FEATURE)

By end of AM-5:

- [ ] All 5 agents completed successfully
- [ ] `npm run build` passes with 0 errors
- [ ] `npm test` shows 10+ new Active Manager tests passing
- [ ] Active Manager card renders in UI
- [ ] No console errors in dev mode
- [ ] All code uses guard clauses, no else statements
- [ ] All domain functions are pure
- [ ] Framework language used throughout (no advice language)
- [ ] Documentation updated
- [ ] Feature branch ready for PR

**Estimated Time**: 30-45 minutes (sequential execution, 5-10 min per agent)

---

**READ GLOBAL_RULES.md BEFORE STARTING**
