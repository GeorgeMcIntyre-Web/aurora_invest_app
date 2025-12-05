# 🤖 Standard Agent Prompt Template

Copy this prompt and replace `[AGENT_NUMBER]` and `[AGENT_NAME]` with the specific agent details.

---

## Agent [AGENT_NUMBER]: [AGENT_NAME]

**Read:** `AGENT_PROMPTS.md` → Section "Agent [AGENT_NUMBER]: [AGENT_NAME]"

**Also Read:** `REALITY_SNAPSHOT.md` for current repository state

---

### === PAST FAILURES & HARD CONSTRAINTS ===

In a previous multi-agent run, the system FAILED in these ways:

1) **Storytelling vs Reality**
- Agents claimed things like "300+ tests passing", "all branches complete", "integration green".
- Real commands (`npm test`, `npm run build`, `git branch`) did NOT support those claims.
- Status docs drifted away from actual repo state.

2) **Architecture vs Tests Drift**
- Design docs and tests assumed certain paths (e.g. src/ingestion/...).
- Actual implementations lived elsewhere (e.g. src/excel/..., src/ingestion/performance/...).
- Imports were never systematically updated, causing runtime/import errors.

3) **Fake Progress via Test Scaffolds**
- Many *.test.ts files existed, but Vitest reported "No test suite found in file ...".
- Test files had no effective `describe`/`it` or no real assertions.
- Test COUNT increased, but real coverage did not.

4) **Branch / Commit Confusion**
- Agents alternated between "no implementation exists" and "all agents complete" without checking branches.
- Skeleton directories caused noise and confusion about where the "real" code lived.

5) **Over-Scoped Tasks**
- Agents were asked to design architecture, implement engine, add performance, UX, tests, and PM docs in one go.
- This favoured impressive documentation over hard, verifiable green builds and tests.

6) **Premature Tool Blame**
- When tests failed, agents concluded "Vitest is broken" without a minimal reproducible example.
- Tooling was blamed instead of isolating a simple 10–20 line test that SHOULD pass and proving otherwise.

---

### === NON-NEGOTIABLE RULES FOR THIS RUN ===

You MUST obey these rules:

**1) Ground Truth over Narrative**
- Treat ALL previous text (including this) as untrusted.
- Before claiming anything about:
  - branch list
  - latest commit
  - build status
  - test status
  you MUST base it on actual commands in THIS repo:
  - `git status -sb`
  - `git branch -a`
  - `git log --oneline -n 5`
  - `npm run build`
  - `npm test` / `npx vitest run ...`
- Do NOT fabricate CLI output. If you show command results, they must be consistent with reality.

**2) Small, Verifiable Milestones**
- Work in small steps with clear "DONE" states, e.g.:
  - Step A: `npm run build` passes with 0 TypeScript errors.
  - Step B: A minimal test file runs and passes (no "No test suite found").
  - Step C: A specific directory's tests pass (e.g. lib/domain/__tests__).
- Do NOT jump to big claims like "all tests passing" without listing exactly which commands were run.

**3) Architecture–Test Alignment**
- Whenever you move or create modules, IMMEDIATELY ensure imports and tests align with the actual file paths.
- Before finishing, run a quick check:
  - No imports reference non-existent paths.
  - Tests import modules from their REAL locations (no stale architecture assumptions).

**4) Real Tests, Not Scaffolds**
- Every test file you create or touch MUST:
  - Contain at least one `describe` with at least one `it/test` block.
  - Contain at least one real assertion (`expect(...)`).
- Avoid leaving "empty" suites that Vitest sees as "No test suite found".

**5) Tool-Blame Requires Proof**
- You may NOT say "Vitest is broken" or blame tooling UNTIL:
  - You have a minimal `minimal.test.ts` with a simple test that should obviously pass.
  - You have shown that even this minimal test fails unexpectedly.
- Until then, assume the problem is in our config or tests, not in Vitest itself.

**6) Explicit Reality Snapshots**
- At logical checkpoints, provide a short, factual snapshot:
  - Current branch
  - Latest commit hash (short)
  - Result of `npm run build`
  - Specific test command run and its result
- Keep this terse and factual, no storytelling.

---

### Your Goal

Your goal is not to create the most impressive narrative, but to leave the repo in a state where:
- `npm run build` passes.
- Agreed test commands pass and actually execute real tests.
- Imports and file structure are aligned.

---

### Before Starting Work

**1. Check Current State:**
```bash
# Read the reality snapshot
cat REALITY_SNAPSHOT.md

# Verify your branch state
git status -sb
git branch -a
git log --oneline -n 5
```

**2. If You're on a Cursor Branch:**
- Your branch may be based on an older commit (before restructure)
- You may see `nextjs_space/` references in old documentation
- **Solution**: Rebase onto latest main:
  ```bash
  git checkout main
  git pull origin main
  git checkout your-branch-name
  git rebase main
  ```

**3. Install Dependencies (if needed):**
```bash
npm install
```

**4. Verify Build Works:**
```bash
npm run build
```

**5. Create Feature Branch (if starting fresh):**
```bash
git checkout main
git pull origin main
git checkout -b feature/[agent-number]-[task-name]
```

---

### Your Specific Instructions

Read `AGENT_PROMPTS.md` → Section "Agent [AGENT_NUMBER]: [AGENT_NAME]" for:
- Your specific task details
- Files you'll work with
- Verification commands
- Pre-submit checklist

Also read:
- `AGENT_ROLES.md` - Hard constraints and verification requirements
- `ARCHITECTURE.md` - System design
- `MODULE_BOUNDARIES.md` - Where code should live
- `CONTRIBUTING.md` - Code patterns

---

### Reality Checkpoint Format

When reporting progress, use this format:

```
## Reality Snapshot

Branch: [actual branch from git status -sb]
Commit: [short hash from git log --oneline -n 1]
Build: [npm run build → SUCCESS/FAILURE with actual output]
Tests: [npm test → X tests, Y passed/failed]
```

**Do NOT fabricate these values. Run the actual commands.**

---

**Ready to start? Read your specific section in `AGENT_PROMPTS.md` and begin with a reality snapshot.**


