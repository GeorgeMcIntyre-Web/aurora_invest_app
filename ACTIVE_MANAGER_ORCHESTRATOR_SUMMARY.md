# 🎯 ACTIVE MANAGER FEATURE - ORCHESTRATION COMPLETE

**Feature Branch**: `feature/active-manager`
**Orchestrator Setup**: ✅ COMPLETE
**Ready for Agent Execution**: ✅ YES
**Commit**: 5cb73f0

---

## 📊 WHAT WAS ACCOMPLISHED

### Orchestration Framework Created

I have set up a **complete multi-agent workflow system** for implementing the Active Manager feature. This framework includes strong countermeasures against all known failure modes and provides concrete, executable tasks for 5 sequential agents.

### Files Created

1. **[agent-workflow/GLOBAL_RULES.md](agent-workflow/GLOBAL_RULES.md)** (260 lines)
   - Non-negotiable coding style rules (guard clauses, no else, etc.)
   - Testing rules (every test must have describe/it/expect)
   - Architecture contracts (no invented functions)
   - Tool blame policy (minimal repro required)
   - Branch discipline (sequential execution only)
   - Framework language requirements
   - Reality checkpoint format

2. **[agent-workflow/contracts/ActiveManagerContracts.ts](agent-workflow/contracts/ActiveManagerContracts.ts)** (180 lines)
   - `ActiveManagerTimeframe` type
   - `ActiveManagerRecommendation` interface (PRIMARY OUTPUT)
   - `ActiveManagerInput` interface
   - `ActiveManagerConfig` interface with default values
   - `ACTIVE_MANAGER_DISCLAIMER` constant
   - `FRAMEWORK_LANGUAGE_PATTERNS` examples
   - Re-exports from AnalysisTypes and portfolioEngine

3. **[agent-workflow/AGENT_TASKS_ACTIVE_MANAGER.md](agent-workflow/AGENT_TASKS_ACTIVE_MANAGER.md)** (850+ lines)
   - **Agent AM-1**: Domain Types & Contracts
   - **Agent AM-2**: Recommendation Engine (7 pure functions)
   - **Agent AM-3**: Recommendation Engine Tests (10+ tests)
   - **Agent AM-4**: UI Integration (card component + dashboard)
   - **Agent AM-5**: End-to-End Validation & Documentation
   - Each task has CONCRETE implementation steps
   - Each task has EXIT CRITERIA with verifiable commands
   - Each task requires REALITY CHECKPOINT at completion

4. **[agent-workflow/ACTIVE_MANAGER_ORCHESTRATION.md](agent-workflow/ACTIVE_MANAGER_ORCHESTRATION.md)** (400+ lines)
   - Main orchestrator control document
   - Failure mode countermeasures checklist
   - Agent execution sequence
   - Verification steps between agents
   - Stop conditions and troubleshooting
   - Success metrics and time budget
   - Orchestration checklist

### Files Modified

1. **package.json** - Minor existing change (not part of this setup)

---

## 🚨 COUNTERMEASURES IMPLEMENTED

### 1. Fake Progress & Empty Tests
**Problem**: Agents create test files with no real tests, claim "tests passing" when runner shows "No test suite found"

**Countermeasure**:
- GLOBAL_RULES.md requires every test file to have describe/it/expect
- Agent AM-3 exit criteria REQUIRE running `npx vitest run` and showing output
- "No test suite found" is explicitly forbidden as a final outcome
- Skipped tests must be documented with WHY and TODO

### 2. Invented Functions / APIs
**Problem**: Agents call functions that don't exist (e.g., `getOrCreateDefaultPortfolio`)

**Countermeasure**:
- ActiveManagerContracts.ts defines ALL allowed types and property names
- GLOBAL_RULES.md lists allowed domain modules (AnalysisTypes, portfolioEngine, contracts)
- Agents must update contracts FIRST before using new functions
- Property name drift is explicitly forbidden (e.g., contract says `primaryAction`, code must use `primaryAction`)

### 3. "Ready to Start" / Template Misuse
**Problem**: Agents reply with "Ready once you clarify..." instead of implementing

**Countermeasure**:
- Every task states "IMPLEMENT NOW - do not wait for confirmation"
- Tasks are CONCRETE with exact file paths and code samples
- Exit criteria are SPECIFIC, MEASURABLE commands
- Orchestrator has instructions to stop and correct this behavior

### 4. Tool Blame Without Evidence
**Problem**: Agents blame Vitest/Jest/Next.js without proof

**Countermeasure**:
- GLOBAL_RULES.md requires minimal reproducible test (10-20 lines)
- Must show the minimal test SHOULD pass but fails
- Until then, assume user error (types, paths, config)

### 5. Merge Chaos & Branch Confusion
**Problem**: Multiple agents edit same files in parallel, causing conflicts

**Countermeasure**:
- SINGLE BRANCH ONLY: `feature/active-manager`
- SEQUENTIAL execution (no parallel editing)
- Commit after EACH agent completes
- Run `git status`, `npm run build`, `npm test` between agents

### 6. Framework Language Violations
**Problem**: Agents use advice language ("you should buy") instead of framework language

**Countermeasure**:
- GLOBAL_RULES.md has explicit allowed/forbidden language sections
- ActiveManagerContracts.ts includes `FRAMEWORK_LANGUAGE_PATTERNS` examples
- Agent AM-2 rationale generation task includes framework language requirements
- Disclaimer constant must be displayed in UI

---

## 🔄 AGENT EXECUTION WORKFLOW

### Sequence (MUST BE SEQUENTIAL)

```
AM-1: Domain Types & Contracts (5-10 min)
  ↓ [commit, verify build]
AM-2: Recommendation Engine Logic (10-15 min)
  ↓ [commit, verify build]
AM-3: Recommendation Engine Tests (10-15 min)
  ↓ [commit, verify build + tests]
AM-4: UI Integration (10-15 min)
  ↓ [commit, verify build + UI]
AM-5: Validation & Documentation (5-10 min)
  ↓ [final commit]
COMPLETE ✅
```

**Total Estimated Time**: 30-45 minutes

### Between Each Agent

Run these commands:
```bash
git status           # Verify expected files changed
npm run build        # Must pass with 0 errors
npm test             # Must show increasing test count (after AM-3)
git add .
git commit -m "feat(active-manager): [agent-name] - [description]"
```

---

## 📋 WHAT EACH AGENT WILL CREATE

### Agent AM-1 (Domain Types)
**Creates**:
- None (modifies existing files only)

**Modifies**:
- `lib/domain/AnalysisTypes.ts` (adds Active Manager re-exports)

**Verifies**:
- `agent-workflow/contracts/ActiveManagerContracts.ts` compiles
- No circular dependencies
- Build passes

### Agent AM-2 (Recommendation Engine)
**Creates**:
- `lib/domain/activeManagerEngine.ts` (~200-300 lines)

**Functions** (7 total):
1. `determineTimeframe` - Maps user horizon to short/medium/long term
2. `calculateConfidenceScore` - Base conviction ± risk tolerance adjustments
3. `determinePrimaryAction` - Buy/hold/trim/sell logic
4. `generateRationale` - 3-6 framework language bullets
5. `generateRiskFlags` - 0-3 risk warnings
6. `generateHeadline` - Action + ticker + confidence descriptor
7. `generateRecommendation` - Main orchestrator function

**Style**:
- Guard clauses, NO else statements
- All functions pure (no side effects)
- Functions < 50 lines each

### Agent AM-3 (Tests)
**Creates**:
- `lib/domain/activeManagerEngine.test.ts` (10+ tests)

**Test Suites**:
- `determineTimeframe` (3 tests)
- `calculateConfidenceScore` (3 tests)
- `determinePrimaryAction` (3 tests)
- `generateRiskFlags` (3 tests)
- `generateRecommendation` (2 integration tests)

**Must Show**:
```
✓ 10+ tests passed
No "No test suite found" message
```

### Agent AM-4 (UI Integration)
**Creates**:
- `components/active-manager-card.tsx` (~150 lines)

**Modifies**:
- `components/analysis-dashboard.tsx` (adds ActiveManagerCard)

**Features**:
- Action icon (buy/sell/trim/hold)
- Confidence score with color coding
- Rationale bullets
- Risk flags (if any)
- Notes (if any)
- Disclaimer text

**Verifies**:
- Build passes
- Dev server starts
- Card renders in UI
- No console errors

### Agent AM-5 (Validation & Docs)
**Creates**:
- `agent-workflow/ACTIVE_MANAGER_COMPLETION_REPORT.md`

**Modifies**:
- `AGENT_GUIDE.md` (adds Active Manager section)
- `ARCHITECTURE.md` (if exists, adds Active Manager section)

**Validates**:
- Full build passes
- Full test suite passes
- Manual UI works
- All documentation updated

---

## ✅ SUCCESS CRITERIA (FEATURE COMPLETE)

Feature is complete when ALL of these are true:

- [ ] All 5 agents executed successfully
- [ ] `npm run build` passes with 0 TypeScript errors
- [ ] `npm test` shows 10+ Active Manager tests passing
- [ ] Active Manager card renders in UI (manual verification)
- [ ] No console errors in dev mode
- [ ] Documentation updated (AGENT_GUIDE.md, completion report)
- [ ] All code uses guard clauses, no else statements
- [ ] All domain functions are pure (no side effects)
- [ ] Framework language used (no advice language)
- [ ] All commits have clear semantic messages
- [ ] Feature branch ready for PR

---

## 🎯 HOW TO USE THIS ORCHESTRATION

### Option 1: Execute Agents Yourself (Recommended)

You can launch each agent yourself by:

1. Reading the agent's task in [AGENT_TASKS_ACTIVE_MANAGER.md](agent-workflow/AGENT_TASKS_ACTIVE_MANAGER.md)
2. Copying the entire task section (including implementation steps and exit criteria)
3. Launching a new Claude Code conversation or sub-agent
4. Pasting the task as the prompt
5. Verifying exit criteria when agent completes
6. Committing changes
7. Moving to next agent

### Option 2: Ask Me to Launch Agents

You can ask me to launch each agent sequentially using the Task tool:

```
"Launch Agent AM-1 now using the task definition in AGENT_TASKS_ACTIVE_MANAGER.md"
```

I will:
- Launch the agent with the full task prompt
- Wait for completion
- Verify exit criteria
- Commit changes
- Report status
- Ask permission to launch next agent

### Option 3: Automate All 5 Agents (Advanced)

You could ask me to:

```
"Launch all 5 Active Manager agents sequentially, verifying exit criteria between each"
```

I will execute the full workflow automatically, pausing only if errors occur.

---

## 📂 KEY FILES TO REFERENCE

### For Orchestrator (You/Me)
- **[ACTIVE_MANAGER_ORCHESTRATION.md](agent-workflow/ACTIVE_MANAGER_ORCHESTRATION.md)** - Main control document
- **[AGENT_TASKS_ACTIVE_MANAGER.md](agent-workflow/AGENT_TASKS_ACTIVE_MANAGER.md)** - Agent task definitions

### For Agents
- **[GLOBAL_RULES.md](agent-workflow/GLOBAL_RULES.md)** - Read FIRST before any task
- **[ActiveManagerContracts.ts](agent-workflow/contracts/ActiveManagerContracts.ts)** - Type contracts
- **[AGENT_GUIDE.md](AGENT_GUIDE.md)** - Project conventions
- **[AGENT_ROLES.md](AGENT_ROLES.md)** - Agent role definitions

### Existing Domain Files (Reference)
- **[lib/domain/AnalysisTypes.ts](lib/domain/AnalysisTypes.ts)** - Core types
- **[lib/domain/auroraEngine.ts](lib/domain/auroraEngine.ts)** - Pure function patterns
- **[lib/domain/portfolioEngine.ts](lib/domain/portfolioEngine.ts)** - Portfolio logic

---

## 🚀 NEXT STEPS

### Immediate Next Step

**Launch Agent AM-1** to extend domain types and verify contracts.

Choose one of:

1. **Manual launch**: Copy Agent AM-1 section from [AGENT_TASKS_ACTIVE_MANAGER.md](agent-workflow/AGENT_TASKS_ACTIVE_MANAGER.md) and paste into new conversation

2. **Ask me to launch**: Say "Launch Agent AM-1 now"

3. **Automate all**: Say "Execute all 5 Active Manager agents sequentially"

### After All Agents Complete

Once AM-5 is done and all success criteria are met:

1. **Create Pull Request**:
   ```bash
   git push -u origin feature/active-manager
   gh pr create --title "feat(active-manager): Add portfolio-aware recommendation engine" \
     --body "$(cat agent-workflow/ACTIVE_MANAGER_COMPLETION_REPORT.md)"
   ```

2. **Review and merge** to main

3. **Optional enhancements** (future work):
   - User settings UI for risk tolerance/horizon
   - Real portfolio integration
   - Historical recommendation tracking
   - Backtest visualization

---

## 📊 CURRENT STATUS

**Orchestration Setup**: ✅ COMPLETE
**Build Status**: ✅ PASSING (0 errors)
**Branch**: `feature/active-manager`
**Commit**: 5cb73f0
**Next Action**: Launch Agent AM-1

---

## 🎯 DESIGN DECISIONS

### Why 5 Agents Instead of 1?

- **Separation of concerns**: Each agent has a clear, focused task
- **Verifiable milestones**: Can verify build/tests after each step
- **Easier debugging**: If issues arise, know exactly which agent caused them
- **Time-bounded**: 5-10 min per agent prevents scope creep

### Why Sequential Execution?

- **No merge conflicts**: Only one agent editing files at a time
- **Clear dependencies**: AM-3 needs AM-2's code, AM-4 needs AM-2's exports, etc.
- **Commit history**: Clean, semantic commits showing feature progression

### Why Contracts File?

- **Type safety**: Property names fixed, no drift between layers
- **Single source of truth**: All agents reference same types
- **Prevents invention**: Agents can't invent new properties or functions

### Why Guard Clauses / No Else?

- **Readability**: Flatter code structure, easier to follow
- **Maintainability**: Less nesting, easier to add conditions
- **Consistency**: Enforced style across entire feature

---

## ⚠️ IMPORTANT REMINDERS

### For Orchestrator (You/Me)

- **Verify exit criteria** after EVERY agent
- **Commit after EVERY agent** with clear message
- **Run build + tests** between agents
- **Stop if build fails** - fix before continuing
- **Stop if tests fail** - fix before continuing
- **Stop if "Ready to start"** - remind agent to implement

### For Agents

- **Read GLOBAL_RULES.md FIRST** before any task
- **Use guard clauses, NO else statements**
- **Keep functions pure** in domain layer
- **Write REAL tests** with describe/it/expect
- **Use framework language** (no advice language)
- **Meet ALL exit criteria** before completing

---

**ORCHESTRATION FRAMEWORK IS READY. YOU CAN NOW LAUNCH AGENT AM-1.**

Would you like me to:
1. Launch Agent AM-1 now using the Task tool?
2. Walk through the AM-1 task with you first?
3. Automatically execute all 5 agents sequentially?

Let me know how you'd like to proceed!
