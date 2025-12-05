# 🎯 Agent Action Prompts - Copy & Paste Ready

Quick action prompts for each agent based on current reality.

---

## Agent 5: "Ensure code reality matches tests and build"

```
Agent 5: Data & Testing Specialist

**Current Status:**
✅ Vitest setup complete locally on main (commits 6d974bc, 0b56634)
⚠️ Commits NOT pushed to origin/main yet
✅ Step 1 complete (Vitest configured)

**Your Next Steps:**

1. **Complete Step 2: Create Test File**
   - Create `lib/domain/auroraEngine.test.ts`
   - Add at least 3 `describe` blocks
   - Add at least 5 `it` blocks with real assertions
   - Test: `classifyFundamentals`, `classifyValuation`, `analyzeStock`
   - Use mock data from `lib/data/mockData.ts`

2. **Complete Step 3: Verify Tests Run**
   - Run: `npm test`
   - Verify tests actually execute (not "No test suite found")
   - Report actual test count and results

3. **Push to Remote**
   - After Step 2 & 3 complete:
     ```bash
     git push origin main
     ```
   - This will make your Vitest setup visible to others

**Reality Snapshot After Step 2:**
```
## Reality Snapshot
Branch: [git status -sb]
Commit: [git log --oneline -n 1]
Build: [npm run build → actual result]
Tests: [npm test → X tests, Y passed - actual count]
```

**Remember:**
- Every test file MUST have describe/it blocks with assertions
- No empty test files
- Report actual test counts, not fabricated numbers

Start Step 2 now (create test file).
```

---

## Agent 4: "Ground truth build and test alignment"

```
Agent 4: Application Orchestrator

**Current Status:**
✅ Step 1 complete (error handling enhancement)
✅ Work on branch: `cursor/ground-truth-build-and-test-alignment-gpt-5.1-codex-high-31c5`
✅ Commit: f8e574c2
⚠️ Branch needs to be merged to main after Step 2

**Your Next Steps:**

1. **Complete Step 2: Loading State UX**
   - Enhance loading states in `app/page.tsx`
   - Add multi-step progress indicators:
     * "Fetching stock data..."
     * "Analyzing fundamentals..."
     * "Generating insights..."
   - Add estimated time or progress percentage if possible
   - Add cancel button during loading (optional)

2. **After Step 2, Provide Reality Snapshot:**
   ```
   ## Reality Snapshot
   Branch: [git status -sb]
   Commit: [git log --oneline -n 1]
   Build: [npm run build → actual result]
   Tests: [npm test → actual result or "not applicable"]
   ```

3. **Prepare for Merge:**
   - After Step 2 complete, rebase onto main:
     ```bash
     git checkout main
     git pull origin main
     git checkout cursor/ground-truth-build-and-test-alignment-gpt-5.1-codex-high-31c5
     git rebase main
     ```
   - Resolve any conflicts if they occur
   - Then we'll merge to main

**Remember:**
- No business logic in application layer
- Keep error handling user-friendly
- Loading states should be informative

Start Step 2 now (loading state UX).
```

---

## Agent 1: "Verify codebase integrity and functionality"

```
Agent 1: Domain Engine Specialist

**Current Status:**
✅ Step 1 complete (quality score function)
✅ Work on branch: `cursor/verify-codebase-integrity-and-functionality-gpt-5.1-codex-high-92fb`
✅ Commit: 2bcaf3cb
✅ Tests passing (8 tests)
⚠️ Branch needs to be merged to main after Step 2

**Your Next Steps:**

1. **Complete Step 2: Update Classification**
   - Modify `classifyFundamentals` in `lib/domain/auroraEngine.ts`
   - Use `calculateFundamentalsQualityScore` to get score
   - Apply thresholds:
     * Strong: Score ≥ 70
     * OK: Score 40-69
     * Weak: Score < 40
     * Unknown: Missing data
   - Keep function signature the same (backward compatible)

2. **Update Tests:**
   - Update existing tests to reflect new classification logic
   - Add test cases for boundary values (70, 40)
   - Ensure all 8+ tests still pass

3. **After Step 2, Provide Reality Snapshot:**
   ```
   ## Reality Snapshot
   Branch: [git status -sb]
   Commit: [git log --oneline -n 1]
   Build: [npm run build → actual result]
   Tests: [npm test → X tests, Y passed - actual count]
   ```

4. **Prepare for Merge:**
   - After Step 2 complete, rebase onto main:
     ```bash
     git checkout main
     git pull origin main
     git checkout cursor/verify-codebase-integrity-and-functionality-gpt-5.1-codex-high-92fb
     git rebase main
     ```
   - Resolve any conflicts if they occur
   - Then we'll merge to main

**Remember:**
- Keep functions pure (no side effects)
- Handle missing data gracefully
- Tests must pass

Start Step 2 now (update classification).
```

---

## Agent 5 (Variant): "Ensure verifiable progress and test alignment"

```
Agent 5: Data & Testing Specialist (Variant)

**Current Status:**
✅ Synced to latest main (commit 8d91090)
⚠️ No work done yet
⚠️ Dependencies not installed

**Your Next Steps:**

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Verify Build:**
   ```bash
   npm run build
   ```

3. **Check Test Status:**
   - If Vitest is set up (from other Agent 5), run: `npm test`
   - If not, you may need to set it up or wait for other Agent 5 to push

4. **Provide Initial Reality Snapshot:**
   ```
   ## Reality Snapshot
   Branch: [git status -sb]
   Commit: [git log --oneline -n 1]
   Build: [npm run build → actual result]
   Tests: [npm test → actual result]
   ```

5. **Wait for Task Assignment:**
   - Once other Agent 5 completes and pushes Vitest setup
   - Or if assigned a different testing task

**For Now:**
Install dependencies, verify build, and provide reality snapshot. Then wait for specific task assignment.

Start with npm install now.
```

---

## Agent 1 (Variant): "Verify and align code reality with commands"

```
Agent 1: Domain Engine Specialist (Variant)

**Current Status:**
⚠️ On cursor branch (old structure)
⚠️ No work done yet
⚠️ Branch structure diverged from main

**Your Next Steps:**

1. **Sync to Latest Main:**
   ```bash
   git checkout main
   git pull origin main
   ```

2. **Create New Feature Branch:**
   ```bash
   git checkout -b feature/agent1-[task-name]
   ```

3. **Install Dependencies:**
   ```bash
   npm install
   ```

4. **Verify Build:**
   ```bash
   npm run build
   ```

5. **Wait for Task Assignment:**
   - The other Agent 1 is working on quality score enhancement
   - You may be assigned a different domain task
   - Or you may help with testing/validation

6. **Provide Initial Reality Snapshot:**
   ```
   ## Reality Snapshot
   Branch: [git status -sb]
   Commit: [git log --oneline -n 1]
   Build: [npm run build → actual result]
   Tests: [npm test → actual result or "not applicable"]
   ```

**For Now:**
Sync to main, create feature branch, verify build. Then wait for specific task assignment.

Start by syncing to main now.
```

---

## 📋 Quick Reference

**Priority Actions:**
1. **Agent 5 (main)**: Complete test files → Push to remote
2. **Agent 4**: Complete loading states → Rebase → Merge
3. **Agent 1**: Complete classification update → Rebase → Merge
4. **Agent 5 (variant)**: Install deps → Verify build → Wait
5. **Agent 1 (variant)**: Sync to main → Wait

**Merge Order (after work complete):**
1. Agent 5 pushes Vitest setup to main
2. Agent 1 rebases and merges quality score
3. Agent 4 rebases and merges error handling + loading


