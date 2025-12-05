# 🎯 ACTIVE MANAGER FEATURE - ORCHESTRATION GUIDE

**Branch**: `feature/active-manager`
**Orchestrator**: Main Claude Code instance (you)
**Agents**: 5 sequential sub-agents (AM-1 through AM-5)
**Estimated Duration**: 30-45 minutes
**Status**: Ready for execution

---

## 📋 QUICK START FOR ORCHESTRATOR

You are the **MAIN ORCHESTRATOR** for the Active Manager feature.

### Your Role
- **NOT** to write all code yourself
- **YES** to manage the agent workflow
- **YES** to verify each agent's output
- **YES** to enforce GLOBAL_RULES.md
- **YES** to prevent known failure modes

### Workflow
1. Read this file (you're doing it now ✓)
2. Execute agents **sequentially** on `feature/active-manager` branch
3. Verify exit criteria between each agent
4. Commit after each agent completes
5. Report status to user at checkpoints

---

## 🚨 CRITICAL FAILURE MODE COUNTERMEASURES

Before starting any agent, ensure you have:

### ✅ Countermeasure 1: Test Quality Enforcement
- Created `agent-workflow/GLOBAL_RULES.md` ✓
- Rule: "Every test file MUST have describe/it/expect"
- Rule: "'No test suite found' is NEVER acceptable"
- Exit criteria for each agent REQUIRE real test execution

### ✅ Countermeasure 2: Architecture Contracts
- Created `agent-workflow/contracts/ActiveManagerContracts.ts` ✓
- All property names FIXED in contract
- Rule: "Only use types from AnalysisTypes, portfolioEngine, or ActiveManagerContracts"
- No function invention allowed

### ✅ Countermeasure 3: Executable Tasks
- Created `agent-workflow/AGENT_TASKS_ACTIVE_MANAGER.md` ✓
- Each agent has CONCRETE steps (not "ready to start" templates)
- Each task ends with EXIT CRITERIA (verifiable commands)
- Each task specifies EXACT files to create/modify

### ✅ Countermeasure 4: Tool Blame Prevention
- GLOBAL_RULES.md requires minimal repro before tool blame
- Agents must assume user error first (types, paths, config)

### ✅ Countermeasure 5: Branch Discipline
- Single branch: `feature/active-manager` ✓
- Sequential execution only (no parallel editing)
- Commit after each agent
- Verify build + tests between agents

### ✅ Countermeasure 6: Template Clarity
- All tasks state "IMPLEMENT NOW - do not wait for confirmation"
- Exit criteria are specific, measurable commands
- Reality checkpoints required at end of each agent

---

## 🤖 AGENT EXECUTION SEQUENCE

Execute in this order. **DO NOT START NEXT AGENT UNTIL PREVIOUS IS VERIFIED.**

### Agent AM-1: Domain Types & Contracts
**Prompt File**: `agent-workflow/AGENT_TASKS_ACTIVE_MANAGER.md` → Section "AGENT AM-1"

**What They Do**:
- Extend `lib/domain/AnalysisTypes.ts` with Active Manager type re-exports
- Verify `agent-workflow/contracts/ActiveManagerContracts.ts` compiles
- Ensure no circular dependencies

**Your Verification**:
```bash
npm run build
```
Expected: 0 errors

**Commit**:
```bash
git add .
git commit -m "feat(active-manager): add domain types and contracts (AM-1)"
```

---

### Agent AM-2: Recommendation Engine (Pure Logic)
**Prompt File**: `agent-workflow/AGENT_TASKS_ACTIVE_MANAGER.md` → Section "AGENT AM-2"

**What They Do**:
- Create `lib/domain/activeManagerEngine.ts`
- Implement 7 pure functions:
  1. `determineTimeframe`
  2. `calculateConfidenceScore`
  3. `determinePrimaryAction`
  4. `generateRationale`
  5. `generateRiskFlags`
  6. `generateHeadline`
  7. `generateRecommendation` (orchestrator)
- Use guard clauses, NO else statements
- All functions pure (no side effects)

**Your Verification**:
```bash
npm run build
```
Expected: 0 errors

Check for:
- No `else` or `else if` statements
- No unary `!` (prefer explicit checks)
- Functions < 50 lines each
- Guard clauses at function start

**Commit**:
```bash
git add .
git commit -m "feat(active-manager): implement recommendation engine logic (AM-2)"
```

---

### Agent AM-3: Recommendation Engine Tests
**Prompt File**: `agent-workflow/AGENT_TASKS_ACTIVE_MANAGER.md` → Section "AGENT AM-3"

**What They Do**:
- Create `lib/domain/activeManagerEngine.test.ts`
- Write 10+ unit tests covering all 7 functions
- Each test has `describe` → `it` → `expect`
- Use realistic mock data

**Your Verification**:
```bash
npm run build  # Should still pass
npx vitest run lib/domain/activeManagerEngine.test.ts
```

Expected output:
```
✓ lib/domain/activeManagerEngine.test.ts (10)
   ✓ determineTimeframe (3)
   ✓ calculateConfidenceScore (3)
   ✓ determinePrimaryAction (3)
   ✓ generateRiskFlags (3)
   ✓ generateRecommendation (2)

Test Files  1 passed (1)
Tests  10 passed (10)
```

**CRITICAL**: If you see "No test suite found", STOP and fix before continuing.

**Commit**:
```bash
git add .
git commit -m "test(active-manager): add comprehensive unit tests (AM-3)"
```

---

### Agent AM-4: UI Integration
**Prompt File**: `agent-workflow/AGENT_TASKS_ACTIVE_MANAGER.md` → Section "AGENT AM-4"

**What They Do**:
- Create `components/active-manager-card.tsx` (UI component)
- Modify `components/analysis-dashboard.tsx` (integrate card)
- Use guard clauses in component
- Follow existing design system (theme classes)

**Your Verification**:
```bash
npm run build  # Should pass
npm run dev    # Should start without errors
```

Manual check:
1. Navigate to app in browser
2. Run analysis for a stock
3. Verify Active Manager card appears
4. Check browser console (should be no errors)
5. Verify disclaimer text is visible

**Commit**:
```bash
git add .
git commit -m "feat(active-manager): integrate UI card into dashboard (AM-4)"
```

---

### Agent AM-5: End-to-End Validation & Documentation
**Prompt File**: `agent-workflow/AGENT_TASKS_ACTIVE_MANAGER.md` → Section "AGENT AM-5"

**What They Do**:
- Run full build verification
- Run full test suite
- Perform manual UI validation
- Update `AGENT_GUIDE.md` with Active Manager section
- Update `ARCHITECTURE.md` (if exists)
- Create `agent-workflow/ACTIVE_MANAGER_COMPLETION_REPORT.md`

**Your Verification**:
```bash
npm run build  # Final build check
npm test       # OR: npx vitest run
npm run dev    # Manual UI test
```

Check:
- All tests pass (existing + new Active Manager tests)
- UI renders correctly
- Documentation is updated
- Completion report is thorough

**Commit**:
```bash
git add .
git commit -m "docs(active-manager): complete validation and documentation (AM-5)"
```

---

## 📊 ORCHESTRATOR CHECKPOINTS

### After Each Agent Completes:

1. **Verify Exit Criteria**:
   - Run commands listed in agent's EXIT CRITERIA section
   - Confirm all checkboxes can be marked ✅

2. **Check Reality Snapshot**:
   - Agent provides branch, commit, build status, test status
   - Verify output matches expected format

3. **Run Standard Commands**:
   ```bash
   git status      # Should show changes in expected files
   npm run build   # Should pass with 0 errors
   npm test        # Should show increasing test count (after AM-3)
   ```

4. **Commit Changes**:
   - Use semantic commit message
   - Prefix: `feat(active-manager):` or `test(active-manager):` or `docs(active-manager):`

5. **Report to User** (optional, at milestones):
   - "AM-1 complete: Types added, build passing"
   - "AM-3 complete: 12 tests added, all passing"
   - "AM-5 complete: Feature ready for PR"

---

## 🚫 STOP CONDITIONS

If any of these occur, **STOP** and investigate:

### Build Failures
```bash
npm run build
# If errors appear, DO NOT continue to next agent
```

**Action**: Fix errors before proceeding. Check:
- Import paths (use `@/` alias correctly)
- Type mismatches
- Circular dependencies

### Test Failures
```bash
npm test
# If "No test suite found" or test failures
```

**Action**:
- If AM-3 or later and "No test suite found" → Fix test file location/syntax
- If test failures → Review and fix implementation or test logic

### Agent Says "Ready to Start"
If an agent replies with "I'm ready once you clarify..." instead of implementing:

**Action**: This is a FAILURE MODE. Remind agent:
- "Your task is to IMPLEMENT NOW, not wait for clarification"
- "Read AGENT_TASKS_ACTIVE_MANAGER.md section for your agent number"
- "Exit criteria require code to be written"

### Agent Invents Functions
If an agent calls functions that don't exist (e.g., `getOrCreateDefaultPortfolio`):

**Action**: STOP immediately. Remind agent:
- "Read agent-workflow/contracts/ActiveManagerContracts.ts"
- "Only use types from AnalysisTypes, portfolioEngine, or contracts"
- "If you need a new function, add it to the contract first, then implement"

---

## 🎯 SUCCESS METRICS

### Feature is Complete When:

- [x] All 5 agents executed successfully
- [ ] `npm run build` passes with 0 TypeScript errors
- [ ] `npm test` shows 10+ Active Manager tests passing
- [ ] Active Manager card renders in UI (manual verification)
- [ ] No console errors in dev mode
- [ ] Documentation updated (AGENT_GUIDE.md, completion report)
- [ ] All code follows GLOBAL_RULES.md (guard clauses, no else, etc.)
- [ ] Framework language used (no advice language)
- [ ] All commits have clear messages
- [ ] Feature branch ready for PR

### Time Budget
- **Target**: 30-45 minutes total
- **Per Agent**: 5-10 minutes
- **Buffer**: 10 minutes for unexpected issues

If exceeding 60 minutes, evaluate if scope creep occurred.

---

## 🛠️ TROUBLESHOOTING GUIDE

### Issue: Agent AM-2 creates code with else statements
**Fix**:
- Review code, identify all else/else if
- Refactor using guard clauses:
  ```typescript
  // ❌ BAD
  function foo(x) {
    if (x > 10) {
      return 'high';
    } else if (x > 5) {
      return 'mid';
    } else {
      return 'low';
    }
  }

  // ✅ GOOD
  function foo(x) {
    if (x > 10) {
      return 'high';
    }
    if (x > 5) {
      return 'mid';
    }
    return 'low';
  }
  ```

### Issue: Agent AM-3 creates empty test file
**Fix**:
- Verify file has `describe` blocks
- Verify each `it` block has `expect` assertion
- Run `npx vitest run lib/domain/activeManagerEngine.test.ts` and show output
- If "No test suite found", check file syntax and location

### Issue: Agent AM-4 UI doesn't render
**Fix**:
- Check browser console for errors
- Verify import paths in `active-manager-card.tsx`
- Verify `analysis-dashboard.tsx` imports and uses `<ActiveManagerCard />`
- Verify props are passed correctly
- Add `console.log(recommendation)` to debug data flow

### Issue: Circular dependency error
**Fix**:
- Check if `ActiveManagerContracts.ts` imports from `AnalysisTypes.ts`
- Check if `AnalysisTypes.ts` imports from `ActiveManagerContracts.ts`
- If both true, this is circular
- Solution: Move type definitions to `AnalysisTypes.ts` directly, OR use separate barrel export

### Issue: Type drift (contract says `primaryAction`, code uses `recommendation.action`)
**Fix**:
- Identify all property name mismatches
- Fix code to match contract exactly
- Re-run `npm run build` to verify

---

## 📝 ORCHESTRATOR RESPONSIBILITIES

### Before Starting:
- ✅ Read this orchestration guide
- ✅ Verify `feature/active-manager` branch exists and is checked out
- ✅ Verify GLOBAL_RULES.md exists
- ✅ Verify contracts file exists
- ✅ Verify AGENT_TASKS_ACTIVE_MANAGER.md exists

### During Execution:
- Launch agents **sequentially** (one at a time)
- Verify exit criteria after each agent
- Run `git status`, `npm run build`, `npm test` between agents
- Commit after each agent with clear message
- Watch for failure modes (fake tests, invented functions, template misuse)

### After Completion:
- Verify all 5 agents completed
- Run final build + test validation
- Manual UI check
- Review completion report
- Prepare for PR creation (next step, not part of this feature scope)

---

## 🚀 NEXT STEPS (AFTER FEATURE COMPLETE)

Once AM-5 is done and all success metrics are met:

1. **Create Pull Request**:
   ```bash
   git push -u origin feature/active-manager
   gh pr create --title "feat(active-manager): Add portfolio-aware recommendation engine" \
     --body "$(cat agent-workflow/ACTIVE_MANAGER_COMPLETION_REPORT.md)"
   ```

2. **User Review**:
   - User reviews PR
   - User tests manually
   - User merges to main (or requests changes)

3. **Optional Enhancements** (future work):
   - User settings UI for risk tolerance/horizon
   - Real portfolio integration (currently uses mock context)
   - Historical recommendation tracking
   - Backtest visualization

---

## 📚 REFERENCE FILES

- **GLOBAL_RULES.md**: `agent-workflow/GLOBAL_RULES.md`
- **Contracts**: `agent-workflow/contracts/ActiveManagerContracts.ts`
- **Agent Tasks**: `agent-workflow/AGENT_TASKS_ACTIVE_MANAGER.md`
- **AGENT_GUIDE.md**: Root level, read for project conventions
- **AGENT_ROLES.md**: Root level, agent role definitions

---

## ✅ ORCHESTRATION CHECKLIST

Use this to track progress:

- [ ] Pre-flight: Branch created, GLOBAL_RULES.md exists, contracts exist
- [ ] AM-1: Types extended, build passes
- [ ] AM-1: Committed with message `feat(active-manager): add domain types and contracts (AM-1)`
- [ ] AM-2: Engine implemented (7 functions), build passes, no else statements
- [ ] AM-2: Committed with message `feat(active-manager): implement recommendation engine logic (AM-2)`
- [ ] AM-3: Tests created (10+ tests), tests pass, no "No test suite found"
- [ ] AM-3: Committed with message `test(active-manager): add comprehensive unit tests (AM-3)`
- [ ] AM-4: UI card created, integrated, build passes, manual UI check OK
- [ ] AM-4: Committed with message `feat(active-manager): integrate UI card into dashboard (AM-4)`
- [ ] AM-5: Docs updated, completion report created, final validation OK
- [ ] AM-5: Committed with message `docs(active-manager): complete validation and documentation (AM-5)`
- [ ] Final: All success metrics met
- [ ] Final: Feature branch ready for PR

---

**YOU ARE THE ORCHESTRATOR. Your job is to manage this workflow, not to write all the code yourself.**

**START WITH AGENT AM-1 NOW.**
