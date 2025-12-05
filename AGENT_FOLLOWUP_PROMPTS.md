# 🔄 Agent Follow-Up Prompts

Quick follow-up prompts to guide agents to their next concrete action.

---

## For Agent 1: Domain Engine Specialist

**After Initial Reality Snapshot:**

```
Good. You've verified the repository state. Now proceed with your domain task.

**Next Step:**
1. If you haven't received a specific task yet, read the domain engine code to understand current implementation:
   - Read `lib/domain/auroraEngine.ts` to see existing functions
   - Read `lib/domain/AnalysisTypes.ts` to understand data structures
   - Identify areas that need enhancement

2. Once you have a specific task (e.g., "Add quality score calculation"), implement it in small steps:
   - Step 1: Add new function/types
   - Step 2: Update existing functions to use new logic
   - Step 3: Test with known inputs
   - Step 4: Verify build passes

3. After each step, provide a reality snapshot:
   ```
   ## Reality Snapshot
   Branch: [git status -sb]
   Commit: [git log --oneline -n 1]
   Build: [npm run build → actual result]
   Tests: [npm test → actual result or "not applicable"]
   ```

**Remember:**
- Keep functions pure (no side effects)
- Add JSDoc comments
- Handle missing data gracefully
- Test with known inputs/outputs

Proceed with implementation when ready.
```

---

## For Agent 4: Application Orchestrator

**After Initial Reality Snapshot:**

```
Good. You've verified the repository state. Now proceed with orchestration enhancements.

**Next Step:**
1. Read the current orchestration code:
   - Read `app/page.tsx` to understand current flow
   - Identify areas needing improvement (error handling, loading states, etc.)

2. Implement enhancements in small steps:
   - Step 1: Improve error handling (categorize errors, add retry logic)
   - Step 2: Enhance loading states (add progress indicators)
   - Step 3: Improve user feedback (better messages, notifications)
   - Step 4: Test error scenarios manually

3. After each step, provide a reality snapshot:
   ```
   ## Reality Snapshot
   Branch: [git status -sb]
   Commit: [git log --oneline -n 1]
   Build: [npm run build → actual result]
   Tests: [npm test → actual result or "not applicable"]
   ```

**Remember:**
- No business logic in application layer
- Call service layer for data
- Call domain engine for analysis
- All error messages must be user-friendly

Proceed with Step 1 (Error Handling Enhancement) when ready.
```

---

## For Agent 5: Data & Testing Specialist

**After Initial Reality Snapshot:**

```
Good. You've verified the repository state. Now set up test infrastructure.

**Next Step:**
1. Set up Vitest (Step 1):
   ```bash
   npm install -D vitest @vitest/ui
   ```
   - Add test script to package.json: `"test": "vitest run"`
   - Create `vitest.config.ts` with proper config
   - Run `npm test` to verify setup works

2. After Step 1, provide reality snapshot:
   ```
   ## Reality Snapshot
   Branch: [git status -sb]
   Commit: [git log --oneline -n 1]
   Build: [npm run build → actual result]
   Tests: [npm test → Vitest version/status]
   ```

3. Then proceed to Step 2: Create real test file
   - Create `lib/domain/auroraEngine.test.ts`
   - Add at least 3 describe blocks
   - Add at least 5 it blocks with real assertions
   - Test classifyFundamentals, classifyValuation, analyzeStock

4. After Step 2, provide reality snapshot:
   ```
   ## Reality Snapshot
   Branch: [git status -sb]
   Commit: [git log --oneline -n 1]
   Build: [npm run build → actual result]
   Tests: [npm test → X tests, Y passed - actual count]
   ```

**Remember:**
- Every test file MUST have describe/it blocks
- Every test MUST have real assertions
- No empty test files
- Tests must actually run (not "No test suite found")

Proceed with Step 1 (Vitest Setup) now.
```

---

## Generic Follow-Up (When Agent Needs Direction)

```
You've verified the repository state. Good.

**Next Steps:**
1. If you haven't received a specific task, review your role:
   - Read your section in AGENT_PROMPTS.md or MEGA_PROMPTS_3_AGENTS.md
   - Understand what files you'll work with
   - Identify what needs to be done

2. Once you have a task, break it into small, verifiable steps:
   - Each step should have a clear "DONE" state
   - Test/build after each step
   - Provide reality snapshot after each step

3. Work incrementally:
   - Don't try to do everything at once
   - Verify each change works before moving on
   - Keep functions pure, imports aligned, tests real

**Reality Snapshot Format (use after each step):**
```
## Reality Snapshot
Branch: [git status -sb]
Commit: [git log --oneline -n 1]
Build: [npm run build → actual result]
Tests: [npm test → actual result]
```

Proceed with your first concrete step when ready.
```

---

## When Agent Reports "No Task Assigned"

```
You're ready to work. Here's your specific task:

**[AGENT-SPECIFIC TASK]**

[Insert the specific task from the task assignments above]

**Implementation Steps:**
1. [Step 1 description]
2. [Step 2 description]
3. [Step 3 description]

**After Each Step:**
Provide a reality snapshot with actual command outputs.

Start with Step 1 now.
```

---

## When Agent Needs to Sync with Main

```
Your branch is behind main. Sync first, then proceed:

**Option 1: Rebase (Recommended)**
```bash
git checkout main
git pull origin main
git checkout your-branch-name
git rebase main
```

**Option 2: Get Specific Files**
```bash
git checkout main -- MEGA_PROMPTS_3_AGENTS.md
git checkout main -- AGENT_PROMPTS_COMPLETE.md
```

**After Syncing:**
1. Verify files are present: `ls -la | grep -i prompt`
2. Run reality check: `git status -sb`, `git log --oneline -n 5`
3. Provide updated reality snapshot
4. Then proceed with your task

Sync now, then continue.
```


