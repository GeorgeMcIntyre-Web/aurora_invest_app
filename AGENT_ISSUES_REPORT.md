# Agent Issues Report & Future Improvements

**Date**: 2025-12-04
**Incident**: Cursor AI agents failed to implement Agent 7 (Portfolio Management)

---

## 🔴 Critical Issues Identified

### Issue 1: Agents Did Not Start Implementation
**Symptom**: Agents said "Ready to start once you specify the concrete domain task" despite being given complete prompts with tasks filled in.

**Root Cause**:
- Agent 7 prompt had the task filled in (lines 44-49), but agents didn't recognize it as actionable
- Agents appeared to be waiting for a follow-up command to actually start coding
- Prompts included "Your task:" but agents treated this as a template, not an instruction

**Evidence**:
- User reported: "they are not starting the work!!! each prompt I give them is bad!"
- Screenshot showed agent saying "Ready to start once you specify the concrete domain task"
- Even with IMPLEMENT_NOW_PROMPT.md follow-up, files weren't created initially

---

### Issue 2: Coordination Failure Between Agents
**Symptom**: Multiple agents created incompatible code with missing functions, type mismatches, and broken imports.

**Root Cause**:
- Agents 1, 4, and 7 worked independently without sharing context
- No central "contract" file defining interfaces between layers
- app/page.tsx (Agent 4) referenced functions that portfolioEngine.ts (Agent 1/7) never created

**Specific Problems**:
1. **Missing Functions**:
   - `summarizeHolding()` - imported in app/page.tsx but never created
   - `getOrCreateDefaultPortfolio()` - called but doesn't exist in portfolioService
   - `getCurrentPrices()` - called but doesn't exist in portfolioService
   - `addHolding()` - called but service only has `upsertHolding()`

2. **Type Mismatches**:
   - app/page.tsx used `PortfolioPriceSnapshot` type that doesn't exist
   - PortfolioContext has `suggestedAction` but code referenced `recommendation.action`
   - PortfolioContext has `existingHolding` but code referenced `holdingSummary`
   - Code referenced `concentration` property that doesn't exist in PortfolioContext

3. **Property Name Inconsistencies**:
   - Type defines: `suggestedAction`, `reasoning`
   - Code used: `recommendation.action`, `recommendation.rationale`

**Impact**: Build failed with 7+ TypeScript errors, requiring manual fixes

---

### Issue 3: Tests Never Worked from Day 1
**Symptom**: All test files showed "No test suite found" error since commit 71dee07 (before portfolio work).

**Root Cause**:
- Vitest 4.x with `globals: true` breaks when you explicitly import `describe`, `it`, `expect` from 'vitest'
- All test files (created by Agent 5) imported `import { describe, expect, it } from 'vitest'`
- Vitest couldn't collect test suites when these functions were imported instead of using globals

**Evidence**:
```typescript
// This breaks test collection in Vitest 4.x with globals: true
import { describe, expect, it } from 'vitest';

describe('test', () => {  // Never executed!
  it('should work', () => {
    expect(1).toBe(1);
  });
});
```

**Fix**: Remove vitest imports, rely on globals provided by vitest.config.ts

**Impact**:
- Tests never ran successfully until manual fix
- This was a pre-existing issue affecting all 4 test files
- Agent 5 (Testing) didn't catch this during implementation

---

### Issue 4: Prompts Generated Without Tasks
**Symptom**: User reported "ai was giving me prompts without the task in it for some strange reason"

**Likely Cause**:
- Templates (AGENT1-6_PROMPT.md) contain `[DESCRIBE YOUR TASK HERE]` placeholder
- User may have accidentally copied template instead of filled-in version
- Or AI regenerated template without preserving the task description
- No clear distinction between "template" vs "ready to use" prompts

---

## 📊 Analysis: Why These Issues Occurred

### 1. **Prompt Structure Problem**
The prompt format `Your task: [description]` may be interpreted as documentation, not as an imperative command.

**Better Format**:
```
TASK (IMPLEMENT THIS NOW):
- Track holdings (ticker, shares, cost basis, purchase date)
- Calculate portfolio metrics (value, gain/loss, beta, volatility)
- Display portfolio dashboard with holdings table

ACTION REQUIRED: Create these files and implement the task above.
```

### 2. **Missing Cross-Layer Contracts**
Agents worked in isolation without a shared interface definition.

**What's Missing**:
- No `lib/contracts/` folder defining interfaces between layers
- No validation that Agent 4 (orchestration) only uses functions that Agent 1 (domain) exports
- No type-checking between what service provides vs what UI consumes

### 3. **No Agent Validation Step**
Agents completed work without verifying:
- Do the imports I'm adding actually exist?
- Do the functions I'm calling match the actual signatures?
- Do my types align with the existing AnalysisTypes.ts?

### 4. **Test Pattern Misunderstanding**
Agent 5 created tests following common Vitest patterns but didn't test against the actual vitest.config.ts configuration.

---

## ✅ Solutions & Improvements

### Improvement 1: Add Explicit Action Commands
**Change**: Make prompts more imperative with clear "DO THIS NOW" sections.

**Before**:
```
Your task: Add portfolio tracking and management system
- Track holdings (ticker, shares, cost basis, purchase date)
```

**After**:
```
⚡ IMPLEMENT THIS TASK NOW - DO NOT JUST ANALYZE:

WHAT TO BUILD:
1. Portfolio tracking system with holdings (ticker, shares, cost basis, purchase date)
2. Portfolio metrics calculator (value, gain/loss, beta, volatility)
3. Portfolio dashboard UI with holdings table

DELIVERABLES REQUIRED:
- lib/domain/portfolioEngine.ts (MUST export: calculatePortfolioMetrics, calculateAllocation, detectConcentrationRisk)
- lib/services/portfolioService.ts (MUST export: portfolioService singleton)
- Tests with REAL assertions (NOT scaffolds)
- Working build (npm run build MUST pass)
- Working tests (npm test MUST pass)

START CODING NOW. Create files immediately.
```

---

### Improvement 2: Add Contract Files for Cross-Layer Interfaces

**Create**: `lib/contracts/PortfolioContracts.ts`

```typescript
/**
 * CONTRACT: Functions that portfolioEngine.ts MUST export
 * Any code importing from portfolioEngine can ONLY use these functions.
 */
export interface PortfolioEngineContract {
  calculateAllocation(portfolio: Portfolio, prices?: Map<string, number>): PortfolioAllocation[];
  calculatePortfolioMetrics(portfolio: Portfolio, prices?: Map<string, number>, betas?: Map<string, number>): PortfolioMetrics;
  detectConcentrationRisk(allocations: PortfolioAllocation[]): ConcentrationRisk;
  suggestPortfolioAction(ticker: string, portfolio: Portfolio, currentWeight: number): { action: PortfolioAction; reasoning: string[] };
}

/**
 * CONTRACT: Methods that portfolioService MUST implement
 * Any code using portfolioService can ONLY call these methods.
 */
export interface PortfolioServiceContract {
  getOrCreateDefaultPortfolio(): Portfolio;
  getCurrentPrices(tickers: string[]): Promise<Map<string, number>>;
  addHolding(portfolioId: string, holding: PortfolioHolding): void;
  // ... other methods
}
```

**Usage in Prompts**:
```
CRITICAL: Before implementing app/page.tsx (Agent 4), you MUST:
1. Read lib/contracts/PortfolioContracts.ts
2. ONLY call functions listed in PortfolioEngineContract
3. ONLY call methods listed in PortfolioServiceContract
4. If you need a function that's not in the contract, STOP and report it
```

---

### Improvement 3: Add Pre-Implementation Checklist

Add this section to ALL agent prompts:

```
🔍 PRE-IMPLEMENTATION CHECKLIST (VERIFY BEFORE CODING):

□ Read all files listed in "Study these files first"
□ Identify the EXACT function signatures you'll use (copy them into your notes)
□ Identify the EXACT types you'll import (verify they exist in AnalysisTypes.ts)
□ If importing from another agent's work, verify those exports exist
□ Check vitest.config.ts to understand test setup (globals: true means NO vitest imports!)

If ANY import/function doesn't exist yet, STOP and report:
"Cannot implement - missing dependency: [function name] from [file]"
```

---

### Improvement 4: Add Post-Implementation Validation

Add this to every agent prompt:

```
✅ POST-IMPLEMENTATION VALIDATION (REQUIRED):

After writing code, run these checks:
1. npm run build (MUST pass with 0 errors)
2. npm test (MUST pass - no "No test suite found")
3. Verify imports: grep -n "^import.*from" [your-file] | while read line; do [check if import exists]; done
4. Verify function calls: List every function you call from other files, verify they exist

If ANY check fails, FIX IT before reporting completion.

DO NOT report "done" if:
- Build has errors
- Tests fail or can't find suites
- You're importing functions that don't exist
- You're using types that aren't defined
```

---

### Improvement 5: Fix Test Pattern in Agent 5 Prompt

**Update AGENT5_PROMPT.md** with this CRITICAL section:

```
🚨 CRITICAL - VITEST 4.x GLOBALS CONFIGURATION:

The project uses vitest.config.ts with globals: true.

DO NOT import test functions:
❌ BAD:  import { describe, expect, it } from 'vitest';
✅ GOOD: (no imports - use globals directly)

Example test file:
```typescript
// NO IMPORTS OF describe, it, expect!
import { calculatePortfolioMetrics } from '../portfolioEngine';

describe('calculatePortfolioMetrics', () => {
  it('calculates correctly', () => {
    expect(result).toBe(expected);
  });
});
```

WHY: Vitest 4.x with globals: true breaks test collection when you explicitly import these functions.

VERIFY: After creating tests, run npm test and confirm "X tests" not "No test suite found"
```

---

### Improvement 6: Create Agent Coordination Workflow

Add `AGENT_COORDINATION.md`:

```markdown
# Agent Coordination Workflow

When multiple agents need to work together:

## Step 1: Domain Agent Creates Contracts
Agent 1 creates:
- `lib/domain/portfolioEngine.ts` with exported functions
- `lib/contracts/PortfolioContracts.ts` documenting all exports

## Step 2: Service Agent Implements Contracts
Agent 2 creates:
- `lib/services/portfolioService.ts` implementing PortfolioServiceContract
- Updates contracts file if needed

## Step 3: UI Agent Consumes Contracts
Agent 3/4:
- MUST read contracts file FIRST
- ONLY import functions listed in contracts
- STOP if needed function is missing

## Step 4: Test Agent Validates Contracts
Agent 5:
- Tests that domain exports match contract
- Tests that service implements contract
- Mocks based on contract interface
```

---

### Improvement 7: Separate Template vs Ready Prompts

**Folder Structure**:
```
/agent-prompts/
  /templates/           ← Empty templates with [DESCRIBE TASK]
    - AGENT1_TEMPLATE.md
    - AGENT2_TEMPLATE.md
  /ready-to-use/        ← Filled-in examples
    - portfolio-management.md
    - dividend-scoring.md
  /contracts/           ← Interface definitions
    - PortfolioContracts.ts
```

**Clear Naming**:
- Templates: `AGENT1_TEMPLATE.md` (obvious it needs filling)
- Ready: `portfolio-management-READY.md` (obvious it's complete)

---

### Improvement 8: Add "IMPLEMENT NOW" Trigger Phrase

Add this at the END of every filled-in prompt:

```
═══════════════════════════════════════════════════════════════
🚀 BEGIN IMPLEMENTATION NOW - DO NOT WAIT FOR FURTHER INSTRUCTIONS
═══════════════════════════════════════════════════════════════

You have all the information you need. START CODING IMMEDIATELY:
1. Create lib/domain/portfolioEngine.ts NOW
2. Create lib/services/portfolioService.ts NOW
3. Create tests NOW
4. Run build and tests NOW
5. Report results NOW

DO NOT:
- Ask "shall I proceed?"
- Say "ready to start when you give the signal"
- Wait for confirmation
- Describe what you would do

START WRITING CODE IN YOUR NEXT MESSAGE.
```

---

## 🎯 Recommended Prompt Structure (Updated Template)

```markdown
# Agent X: [Feature Name]

## 🔍 STEP 1: STUDY THESE FILES FIRST
[List of files to read with specific patterns to learn]

## 📋 STEP 2: READ THE CONTRACT
File: lib/contracts/[FeatureName]Contracts.ts
This defines EXACTLY what functions you must export and what you can import.

## ⚡ STEP 3: IMPLEMENT THIS TASK NOW

WHAT TO BUILD:
- [Specific deliverable 1]
- [Specific deliverable 2]

FILES TO CREATE:
- lib/domain/[file].ts (MUST export: [function1], [function2])
- lib/services/[file].ts (MUST export: [service singleton])

## 🔍 STEP 4: PRE-IMPLEMENTATION CHECKLIST
□ Verified all imports exist
□ Verified all types exist in AnalysisTypes.ts
□ Read vitest.config.ts (globals: true = NO vitest imports!)
□ Read contracts file to know what you can call

## ✅ STEP 5: POST-IMPLEMENTATION VALIDATION
After coding:
1. npm run build (MUST pass)
2. npm test (MUST show "X tests passing", not "No test suite found")
3. Verify no missing imports

## 🚀 BEGIN IMPLEMENTATION NOW
You have all information. START CODING IMMEDIATELY in your next message.
DO NOT ask "shall I proceed?" - just CREATE FILES and WRITE CODE.
```

---

## 📝 Summary of Fixes Needed

### High Priority (Do Now)
1. ✅ **Fix Vitest test pattern** - Update AGENT5_PROMPT.md to NOT import vitest functions
2. ✅ **Add IMPLEMENT NOW trigger** - Add explicit "START CODING NOW" section to all prompts
3. ✅ **Create contracts folder** - Add `lib/contracts/` with interface definitions
4. ✅ **Separate templates** - Move templates to `/templates/`, ready prompts to `/ready-to-use/`

### Medium Priority (Next Sprint)
5. ⚠️ **Add validation steps** - Pre/post implementation checklists in all prompts
6. ⚠️ **Add coordination workflow** - Document how agents should work together
7. ⚠️ **Update START_HERE** - Point to new folder structure

### Low Priority (Nice to Have)
8. 💡 **Add CI check** - GitHub Action to verify agent outputs match contracts
9. 💡 **Add agent debugger** - Tool to validate agent followed the prompt correctly

---

## 🔄 Lessons Learned

1. **Agents need explicit commands**: "Your task:" is too passive. Use "IMPLEMENT NOW:" instead.

2. **Agents don't validate cross-layer dependencies**: They assume imports exist. Need contracts + validation.

3. **Agents follow common patterns over project-specific config**: Agent 5 used standard Vitest imports even though project uses globals. Need to call out config explicitly.

4. **Agents stop at analysis**: Need explicit trigger phrase to move from planning to coding.

5. **Coordination requires contracts**: Multiple agents need a shared interface definition, not just file names.

---

**End of Report**
