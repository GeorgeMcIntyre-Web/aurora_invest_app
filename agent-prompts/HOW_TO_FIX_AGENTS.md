# How to Fix Agent Prompts - Quick Reference

Based on the issues encountered with Agent 7 (Portfolio Management), here are the key fixes to apply to all agent prompts.

---

## 🚨 Critical Fix #1: Remove Vitest Imports (Agent 5)

**Problem**: Tests fail with "No test suite found" when using `import { describe, it, expect } from 'vitest'` with `globals: true` in Vitest 4.x.

**Fix**: Update AGENT5_PROMPT.md with this section:

```markdown
🚨 CRITICAL - VITEST 4.x CONFIGURATION:

This project uses vitest.config.ts with globals: true.

❌ DO NOT import test functions:
import { describe, expect, it } from 'vitest';  // WRONG!

✅ Use globals directly (no imports needed):
// NO IMPORTS - globals provided by vitest.config.ts
import { Portfolio } from '../portfolioEngine';

describe('Portfolio tests', () => {
  it('calculates metrics', () => {
    expect(result).toBe(expected);
  });
});
```

**Verification**: After creating tests, run `npm test` and confirm you see "X tests passing", NOT "No test suite found"

---

## 🚨 Critical Fix #2: Add "IMPLEMENT NOW" Trigger

**Problem**: Agents analyze and say "ready to start" but don't actually create files.

**Fix**: Add this to the END of every prompt:

```markdown
═══════════════════════════════════════════════════════════════
🚀 BEGIN IMPLEMENTATION NOW - DO NOT WAIT FOR CONFIRMATION
═══════════════════════════════════════════════════════════════

You have all the information you need. START CODING IMMEDIATELY:

1. Create [file1.ts] NOW
2. Create [file2.ts] NOW
3. Create tests NOW
4. Run npm run build (MUST pass with 0 errors)
5. Run npm test (MUST show "X tests passing")
6. Report git status, build output, test output

DO NOT:
❌ Ask "shall I proceed?"
❌ Say "ready to start when you give the signal"
❌ Describe what you would do without doing it
❌ Wait for confirmation

✅ START WRITING CODE IN YOUR NEXT MESSAGE
```

---

## 🚨 Critical Fix #3: Add Contract Validation

**Problem**: Agents call functions that don't exist because they work in isolation.

**Fix**: Add pre-implementation checklist to every prompt:

```markdown
🔍 PRE-IMPLEMENTATION CHECKLIST (COMPLETE BEFORE CODING):

Before writing ANY code, verify:

□ Read lib/contracts/[Feature]Contracts.ts (if exists)
□ List EVERY function you will import from other files
□ Verify EACH import exists by checking the source file exports
□ Verify EACH type exists in AnalysisTypes.ts or domain file
□ Check vitest.config.ts (globals: true = NO vitest imports!)

STOP RULE: If ANY import/function doesn't exist, STOP and report:
"Cannot implement - missing dependency: [functionName] from [filePath]"
"Required for: [what you're trying to do]"
"Solution: Need [other agent] to implement this first OR update contract"
```

---

## 🚨 Critical Fix #4: Add Post-Implementation Validation

**Fix**: Add this after the task description:

```markdown
✅ POST-IMPLEMENTATION VALIDATION (REQUIRED BEFORE REPORTING DONE):

After writing code, you MUST run these checks:

1. Build Check:
   ```bash
   npm run build
   ```
   MUST pass with 0 errors. If it fails, FIX THE ERRORS before proceeding.

2. Test Check:
   ```bash
   npm test
   ```
   MUST show "X tests passing", NOT "No test suite found"
   If tests fail, FIX THEM before proceeding.

3. Import Validation:
   - List every `import { X } from 'Y'` statement in your files
   - Verify X is exported from Y
   - If any import is missing, FIX IT

4. Type Validation:
   - List every type you're using
   - Verify it's defined in AnalysisTypes.ts or your domain file
   - If any type is missing, DEFINE IT

DO NOT report "implementation complete" until ALL checks pass.
```

---

## 🎯 Improved Prompt Structure

Here's the recommended structure for ALL agent prompts:

```markdown
# Agent X: [Feature Name]

## 📚 STEP 1: STUDY PATTERNS (Read First)

Study these files to understand existing patterns:
1. [file1.ts] - Learn [specific pattern]
   - Example: calculateX naming convention
   - Example: Pure function structure
2. [file2.ts] - Learn [specific pattern]

## 📋 STEP 2: READ THE CONTRACT (If Exists)

File: agent-prompts/contracts/[Feature]Contracts.ts

This defines EXACTLY:
- What functions you MUST export (your deliverables)
- What functions you CAN import (from other layers)

If contract doesn't exist, you're defining it - document your exports clearly.

## ⚡ STEP 3: YOUR TASK

IMPLEMENT THIS NOW - DO NOT JUST ANALYZE:

WHAT TO BUILD:
- [Concrete deliverable 1 with success criteria]
- [Concrete deliverable 2 with success criteria]

FILES TO CREATE:
- lib/domain/[name].ts
  MUST export: function1, function2, function3
  MUST be pure functions (no API calls, no side effects)

- lib/services/[name].ts
  MUST export: singleton instance
  MUST implement: method1, method2, method3

## 🔍 STEP 4: PRE-IMPLEMENTATION CHECKLIST

[Paste checklist from Fix #3 above]

## ✅ STEP 5: POST-IMPLEMENTATION VALIDATION

[Paste validation steps from Fix #4 above]

## 🚀 STEP 6: BEGIN NOW

[Paste "IMPLEMENT NOW" trigger from Fix #2 above]
```

---

## 📝 Quick Action Items

To fix existing prompts:

1. **Update AGENT5_PROMPT.md**:
   - Add Vitest 4.x warning about globals
   - Show example WITHOUT vitest imports
   - Add verification step to check "npm test" output

2. **Update ALL AGENT prompts (1-7)**:
   - Add "IMPLEMENT NOW" trigger at the end
   - Add pre-implementation checklist
   - Add post-implementation validation
   - Convert "Your task:" to "IMPLEMENT THIS NOW:"

3. **Create contract files**:
   - agent-prompts/contracts/PortfolioContracts.ts ✅ (created)
   - agent-prompts/contracts/AnalysisContracts.ts (for domain/service alignment)

4. **Reorganize files**:
   ```
   agent-prompts/
     templates/          ← Templates with [PLACEHOLDERS]
     ready-to-use/       ← Filled examples
     contracts/          ← Interface contracts
     HOW_TO_USE.md       ← User guide
   ```

---

## 🔄 Testing the Fixes

After updating prompts, test with a new feature:

1. Choose a small feature (e.g., "Add dividend yield calculator")
2. Use updated Agent 1 prompt
3. Verify agent:
   - ✅ Starts coding immediately (doesn't say "ready to start")
   - ✅ Creates files without asking permission
   - ✅ Runs build and tests
   - ✅ Reports pass/fail status
   - ✅ Fixes errors before reporting "done"

If agent still waits for confirmation, the "IMPLEMENT NOW" trigger needs to be stronger.

---

**Last Updated**: 2025-12-04
