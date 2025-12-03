# 🤖 Agent Roles & Work Assignment

**CRITICAL: Read the constraints section below before starting any work.**

Each agent must read their assigned file to determine their specific work. This document only assigns roles and files.

---

## ⚠️ NON-NEGOTIABLE RULES (READ FIRST)

### Ground Truth Over Narrative
- **BEFORE** claiming anything about branches, commits, build status, or tests, you MUST run actual commands:
  ```bash
  git status
  git branch -a
  git log --oneline -n 5
  npm run build
  npm test  # or npx vitest run
  ```
- **DO NOT** fabricate CLI output. Show real command results only.

### Small, Verifiable Milestones
Work in small steps with clear "DONE" states:
- ✅ Step A: `npm run build` passes with 0 TypeScript errors
- ✅ Step B: A minimal test file runs and passes (no "No test suite found")
- ✅ Step C: Specific directory's tests pass
- ❌ Do NOT claim "all tests passing" without listing exact commands run

### Architecture–Test Alignment
- When moving/creating modules, IMMEDIATELY update imports and tests
- Before finishing, verify:
  - No imports reference non-existent paths
  - Tests import from REAL file locations (not stale assumptions)

### Real Tests, Not Scaffolds
Every test file MUST:
- Contain at least one `describe` with at least one `it`/`test` block
- Contain at least one real assertion (`expect(...)`)
- Avoid empty suites that Vitest reports as "No test suite found"

### Tool-Blame Requires Proof
You may NOT say "Vitest is broken" UNTIL:
- You have a minimal `minimal.test.ts` with a simple test that should pass
- You've shown this minimal test fails unexpectedly
- Until then, assume the problem is in config/tests, not the tool

### Explicit Reality Snapshots
At checkpoints, provide factual snapshot:
```
Branch: main
Commit: abc1234
Build: npm run build → SUCCESS (0 errors)
Tests: npx vitest run → 5 tests, 5 passed
```

---

## 👥 Agent Roles & File Assignments

**Quick Reference:** See `AGENT_ASSIGNMENTS.md` for simple list.

### Agent 1: Domain Engine Specialist
**Read This File:** `AGENT_PROMPTS.md` → Section "Agent 1: Domain Engine Specialist"

**Your Work Location:**
- `lib/domain/auroraEngine.ts` - Analysis engine (PURE functions only)
- `lib/domain/AnalysisTypes.ts` - Type definitions

**Verification Commands:**
```bash
# 1. Verify no side effects (check for fetch, API calls, React imports)
grep -r "fetch\|import.*react\|localStorage" lib/domain/auroraEngine.ts

# 2. TypeScript compilation
npm run build

# 3. If tests exist, run them
npx vitest run lib/domain/
```

**Reality Checkpoint:**
- [ ] `npm run build` passes with 0 errors
- [ ] No React/API imports in domain engine
- [ ] All functions are pure (same input = same output)

---

### Agent 2: UI Component Developer
**Read This File:** `AGENT_PROMPTS.md` → Section "Agent 2: UI Component Developer"

**Your Work Location:**
- `components/*.tsx` - React components
- `components/ui/*.tsx` - UI primitives

**Verification Commands:**
```bash
# 1. TypeScript compilation
npm run build

# 2. Check for linting errors
npm run lint

# 3. Verify component renders (manual or test)
```

**Reality Checkpoint:**
- [ ] `npm run build` passes
- [ ] `npm run lint` passes (or shows only pre-existing errors)
- [ ] Component receives data via props (no direct API calls)

---

### Agent 3: API Integration Specialist
**Read This File:** `AGENT_PROMPTS.md` → Section "Agent 3: API Integration Specialist"

**Your Work Location:**
- `lib/services/marketDataService.ts` - Service layer
- `.env.example` - Environment variables documentation

**Verification Commands:**
```bash
# 1. TypeScript compilation
npm run build

# 2. Verify service implements interface
# (Check that your class implements MarketDataService)

# 3. Test service (if test exists)
npx vitest run lib/services/
```

**Reality Checkpoint:**
- [ ] `npm run build` passes
- [ ] Service class implements `MarketDataService` interface
- [ ] No API keys hardcoded (use environment variables)
- [ ] Service maps external data to `StockData` type correctly

---

### Agent 4: Application Orchestrator
**Read This File:** `AGENT_PROMPTS.md` → Section "Agent 4: Application Orchestrator"

**Your Work Location:**
- `app/page.tsx` - Main orchestration

**Verification Commands:**
```bash
# 1. TypeScript compilation
npm run build

# 2. Check for runtime errors
npm run dev  # Start dev server, check console
```

**Reality Checkpoint:**
- [ ] `npm run build` passes
- [ ] No business logic in application layer (only orchestration)
- [ ] Error messages are user-friendly

---

### Agent 5: Data & Testing Specialist
**Read This File:** `AGENT_PROMPTS.md` → Section "Agent 5: Data & Testing Specialist"

**Your Work Location:**
- `lib/data/mockData.ts` - Mock data
- `__tests__/` or `*.test.ts` - Test files

**Verification Commands:**
```bash
# 1. TypeScript compilation
npm run build

# 2. Run tests (MUST show real test execution)
npx vitest run

# 3. Verify test file has real tests (not empty)
# Check that test files have describe/it blocks with assertions
```

**Reality Checkpoint:**
- [ ] `npm run build` passes
- [ ] `npx vitest run` executes tests (not "No test suite found")
- [ ] Each test file has at least one `describe` with one `it` and one `expect`
- [ ] Mock data matches `StockData` interface

---

### Agent 6: Full-Stack Feature Developer
**Read This File:** `AGENT_PROMPTS.md` → Section "Agent 6: Full-Stack Feature Developer"

**Your Work Location:**
- Multiple files across layers (see MODULE_BOUNDARIES.md)

**Verification Commands:**
```bash
# 1. TypeScript compilation
npm run build

# 2. Run all tests
npx vitest run

# 3. Check imports are correct
# Verify no imports reference non-existent paths
```

**Reality Checkpoint:**
- [ ] `npm run build` passes with 0 errors
- [ ] All imports reference existing files
- [ ] Tests run and pass (not empty scaffolds)
- [ ] Module boundaries respected (see MODULE_BOUNDARIES.md)

---

## 📋 Pre-Submit Checklist (ALL Agents)

Before claiming work is complete, verify:

### Ground Truth Verification
- [ ] Ran `git status` - show actual output
- [ ] Ran `git branch -a` - show actual branches
- [ ] Ran `npm run build` - show actual result (SUCCESS or specific errors)
- [ ] Ran `npm test` or `npx vitest run` - show actual test count and results

### Code Quality
- [ ] No TypeScript errors (`npm run build` passes)
- [ ] No imports reference non-existent paths
- [ ] All test files have real tests (not empty scaffolds)
- [ ] Module boundaries respected (see MODULE_BOUNDARIES.md)

### Documentation
- [ ] No claims about "all tests passing" without showing command output
- [ ] No claims about "all branches complete" without showing `git branch -a`
- [ ] Reality snapshot provided (branch, commit, build status, test status)

---

## 🚨 Common Failures to Avoid

### ❌ DO NOT:
1. Claim "300+ tests passing" without running `npm test` and showing output
2. Claim "all branches complete" without running `git branch -a`
3. Create test files with no `describe`/`it` blocks (Vitest will say "No test suite found")
4. Leave imports pointing to non-existent paths
5. Blame tooling without a minimal reproducible example

### ✅ DO:
1. Run actual commands and show real output
2. Work in small, verifiable steps
3. Create real tests with assertions
4. Verify imports match actual file locations
5. Provide factual snapshots at checkpoints

---

## 📍 Quick Reference

**Git Setup:** See `GIT_SETUP.md`
**Architecture:** See `ARCHITECTURE.md`
**Module Boundaries:** See `MODULE_BOUNDARIES.md`
**Code Patterns:** See `CONTRIBUTING.md`
**Your Specific Task:** See `AGENT_PROMPTS.md` → Your agent number

---

**Remember: Ground truth over narrative. Real commands over claims.**

