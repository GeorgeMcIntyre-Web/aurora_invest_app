# 🚨 GLOBAL RULES FOR ALL AGENTS

**READ THIS FIRST before executing any agent task.**

These rules apply to ALL agents working on this codebase. Violating these rules will result in broken builds, failed tests, and wasted time.

---

## 📏 CODING STYLE (NON-NEGOTIABLE)

### Guard Clauses
- Use guard clauses at the start of functions
- Return early for invalid/edge cases
- **DO NOT** use `else` or `else if` in new code
- Avoid nesting more than two levels

Example:
```typescript
// ✅ GOOD - guard clauses
function analyze(stock: StockData): AnalysisResult {
  if (!stock) {
    return defaultAnalysis;
  }
  if (!stock.fundamentals) {
    return basicAnalysis(stock);
  }

  return fullAnalysis(stock);
}

// ❌ BAD - else statements
function analyze(stock: StockData): AnalysisResult {
  if (stock) {
    if (stock.fundamentals) {
      return fullAnalysis(stock);
    } else {
      return basicAnalysis(stock);
    }
  } else {
    return defaultAnalysis;
  }
}
```

### Boolean Logic
- Use `===` and `!==` normally
- **AVOID** unary `!` in new code where possible
- Prefer clear predicates over negation

Example:
```typescript
// ✅ GOOD - explicit predicates
const hasValidData = data !== null && data !== undefined;
const isEmpty = items.length === 0;
const isReady = status === 'ready';

// ⚠️ ACCEPTABLE but avoid in new code
if (!data) { /* ... */ }

// ✅ BETTER for new code
if (data === null || data === undefined) { /* ... */ }
```

### TypeScript Types
- Prefer precise TypeScript types over `any`
- Use union types for known variants
- Use optional properties `?` for nullable fields
- Export types from `lib/domain/AnalysisTypes.ts`

### Function Size
- Keep functions compact (ideally < 50 lines)
- Extract complex logic into named helper functions
- One level of abstraction per function

---

## 🧪 TESTING RULES (CRITICAL)

### Every Test File MUST:
1. **Contain at least one `describe` block**
2. **Contain at least one `it` or `test` block inside `describe`**
3. **Contain at least one real assertion with `expect(...)`**
4. **Be picked up by the test runner** (placed in correct directory)

### ❌ NEVER ACCEPTABLE:
```typescript
// ❌ NO TESTS - This is NOT a test file
import { myFunction } from './myModule';

// Empty file or only comments

// ❌ SKIPPED TESTS ONLY
describe.skip('MyModule', () => {
  it.skip('should do something', () => {
    expect(true).toBe(true);
  });
});

// ❌ NO ASSERTIONS
describe('MyModule', () => {
  it('should do something', () => {
    myFunction();
    // No expect() call!
  });
});
```

### ✅ MINIMUM ACCEPTABLE:
```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from './myModule';

describe('MyModule', () => {
  it('should return expected result', () => {
    const result = myFunction(42);
    expect(result).toBe(84);
  });
});
```

### Test Execution Verification:
- **"No test suite found"** is NEVER acceptable as a final outcome
- Before marking task complete, run `npm test` or `npx vitest run`
- Verify output shows `X tests passed` where X > 0
- If tests are intentionally skipped, document:
  - **WHY** they are skipped (e.g., "Awaiting API integration")
  - **TODO** with expected completion (e.g., "TODO: Unskip after Agent 3 completes")

---

## 🏗️ ARCHITECTURE RULES

### NO Invented Functions
- **ONLY** use functions that exist in the codebase
- **ONLY** use types defined in `lib/domain/AnalysisTypes.ts`, `portfolioEngine.ts`, or contract files
- If you need a new function:
  1. Update the contract file (e.g., `ActiveManagerContracts.ts`)
  2. Implement it in the correct module
  3. Export it properly
  4. **Then** use it

### Allowed Domain Functions
For **Active Manager** feature, you may ONLY use:
- Types from `lib/domain/AnalysisTypes.ts`
- Functions from `lib/domain/auroraEngine.ts`
- Functions from `lib/domain/portfolioEngine.ts`
- Types/functions from `agent-workflow/contracts/ActiveManagerContracts.ts` (once created)

### ❌ NEVER Invent These:
```typescript
// ❌ These do NOT exist - do not invent them
getOrCreateDefaultPortfolio()
summarizeHolding()
getCurrentPrices()
fetchRecommendation()
```

### Type Name Consistency:
- If contract defines `primaryAction`, code must use `primaryAction` (not `recommendation.action`)
- If contract defines `confidenceScore`, code must use `confidenceScore` (not `confidence`)
- **NO** property name drift between layers

---

## 🔬 TOOL BLAME POLICY

### Before Blaming Framework/Tool:
You may NOT claim "Vitest is broken", "Next.js has a bug", or "TypeScript is failing" UNTIL:

1. You create a **minimal reproducible test** (10-20 lines)
2. The test clearly SHOULD pass based on official docs
3. The test fails in the exact same way
4. You provide the minimal test file path and error output

### Until Then, Assume:
- Type errors → your types are wrong
- Import errors → your paths are wrong
- Test not found → your file location is wrong
- Test not running → your config/syntax is wrong

---

## 🌿 BRANCH & MERGE RULES

### For Active Manager Feature:
1. **SINGLE BRANCH ONLY**: `feature/active-manager`
2. **NO parallel editing** - agents run SEQUENTIALLY
3. **Between agents**, ALWAYS:
   ```bash
   git status
   npm run build
   npm test
   ```
4. **Commit** after each agent completes with clear message
5. **NO force push** unless explicitly requested by user

### Commit Messages:
```bash
# ✅ GOOD
git commit -m "feat(active-manager): implement ActiveManagerRecommendation types"
git commit -m "feat(active-manager): add generateRecommendation domain function"
git commit -m "test(active-manager): add unit tests for recommendation logic"

# ❌ BAD
git commit -m "updates"
git commit -m "fix stuff"
git commit -m "WIP"
```

---

## 📋 TEMPLATE INTERPRETATION

### When You See "Your task is to...":
- This is a **COMMAND**, not documentation
- **IMPLEMENT NOW** - do not wait for confirmation
- Do not reply "Ready to start once you clarify..."
- Do not paraphrase the plan without editing files

### Task Completion Means:
1. **Files edited** (not just read)
2. **Code written** (not just planned)
3. **Tests created** (real tests with assertions)
4. **Build passes** (`npm run build` shows 0 errors)
5. **Tests pass** (`npm test` shows X passed, 0 failed)

### Exit Criteria Format:
Every agent task will end with EXIT CRITERIA:
```markdown
## EXIT CRITERIA
- [ ] `npm run build` passes with 0 TypeScript errors
- [ ] `npm test` shows at least 1 test passed
- [ ] File X contains Y
- [ ] No imports reference non-existent modules
```

**ALL criteria must be met** before task is complete.

---

## 🎯 FRAMEWORK LANGUAGE (Financial Advice Prohibition)

### ✅ ALLOWED Framework Language:
- "Many investors with similar profiles..."
- "Typical guardrails suggest..."
- "A framework approach might..."
- "Concentration risk thresholds often..."
- "Some frameworks use..."

### ❌ FORBIDDEN Advice Language:
- "You should buy/sell..."
- "This is a good investment..."
- "You must trim this position..."
- "I recommend buying..."
- "You need to..."

### Required Disclaimers:
- Always maintain existing disclaimer text
- Active Manager recommendations must include:
  - "Framework-based suggestion only"
  - "Not personalized financial advice"
  - Reference to consulting professional advisors

---

## 🚫 FORBIDDEN PATTERNS

### DO NOT:
1. ❌ Create test files with no `describe`/`it` blocks
2. ❌ Claim "tests passing" without running test command
3. ❌ Invent functions that don't exist
4. ❌ Use `any` type in new code
5. ❌ Add side effects to domain functions
6. ❌ Import React in domain modules
7. ❌ Use `else` or `else if` in new code
8. ❌ Nest more than 2 levels deep
9. ❌ Commit without clear message
10. ❌ Skip exit criteria verification

### DO:
1. ✅ Use guard clauses
2. ✅ Run `npm run build` before claiming success
3. ✅ Run `npm test` and show real output
4. ✅ Keep functions pure in domain layer
5. ✅ Use precise TypeScript types
6. ✅ Extract helpers for complex logic
7. ✅ Handle missing data gracefully
8. ✅ Verify all imports exist
9. ✅ Write real tests with assertions
10. ✅ Meet ALL exit criteria

---

## 📊 REALITY CHECKPOINT FORMAT

Before completing your task, provide:

```markdown
## REALITY CHECKPOINT

**Branch**: feature/active-manager
**Commit**: abc1234 (first 7 chars of git rev-parse HEAD)

**Build Status**:
```
$ npm run build
> build
✓ Compiled successfully
```

**Test Status**:
```
$ npm test
✓ 8 tests passed (8)
```

**Files Modified**:
- lib/domain/AnalysisTypes.ts (added ActiveManagerRecommendation)
- lib/domain/activeManagerEngine.ts (new file, 3 functions)

**Files Created**:
- lib/domain/activeManagerEngine.test.ts (8 tests)

**Exit Criteria Met**: ✅ All 4 criteria verified
```

---

## 🆘 WHEN BLOCKED

### If you encounter issues:
1. Check existing codebase for similar patterns
2. Read `AGENT_GUIDE.md` for project conventions
3. Read `MODULE_BOUNDARIES.md` for architecture rules
4. Read `ARCHITECTURE.md` for system design
5. Create minimal repro (if tooling issue)
6. **DO NOT** fabricate solutions or invented APIs

---

**Remember**: Ground truth over narrative. Real commands over claims. Implementation over plans.

**These rules are NON-NEGOTIABLE** for the Active Manager feature and all future work.
