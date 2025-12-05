# 📊 Current Repository Reality Snapshot

**Last Updated:** Based on actual git commands run

## Ground Truth (Verified via Commands)

### Git State
```bash
$ git status -sb
## main...origin/main

$ git branch -a
* main
  remotes/origin/HEAD -> origin/main
  remotes/origin/main
  remotes/origin/cursor/ensure-code-reality-matches-tests-and-build-gpt-5.1-codex-high-981f
  remotes/origin/cursor/ensure-verifiable-progress-and-test-alignment-gpt-5.1-codex-high-aa6d
  remotes/origin/cursor/ground-truth-build-and-test-alignment-gpt-5.1-codex-high-31c5
  remotes/origin/cursor/verify-and-align-code-reality-with-commands-gpt-5.1-codex-high-7e17
  remotes/origin/cursor/verify-and-align-codebase-reality-gpt-5.1-codex-high-cf80

$ git log --oneline -n 5
b049c7c (HEAD -> main, origin/main, origin/HEAD) refactor: restructure repository to follow best practices
cd36f68 docs: add comprehensive agent documentation and improve code quality
5f74278 First Commit
```

### Branch Structure
- **Main branch**: `b049c7c` - Repository restructured (files moved from `nextjs_space/` to root)
- **Agent branches**: All based on `cd36f68` (before restructure)
  - These branches still have `nextjs_space/` structure
  - One branch (`cursor/verify-and-align-codebase-reality-gpt-5.1-codex-high-cf80`) has additional commit `4b837a7` adding Vitest

### Documentation State
- **Main branch**: All `nextjs_space/` references removed ✅
- **Agent branches**: Still contain `nextjs_space/` references (they branched before restructure)

### Build/Test Status
- **Dependencies**: Not installed (`node_modules` does not exist)
- **Build**: Not verified (requires `npm install` first)
- **Tests**: Not verified (requires `npm install` first)

## Important Notes for Agents

### If You're on a Cursor Branch
1. Your branch is based on `cd36f68` (before the restructure)
2. You may see `nextjs_space/` references in documentation
3. **Solution**: Merge or rebase onto `main` to get the latest structure:
   ```bash
   git checkout main
   git pull origin main
   git checkout your-branch-name
   git rebase main  # or git merge main
   ```

### If You're on Main
1. All files are at the root (no `nextjs_space/` subdirectory)
2. All documentation paths are updated
3. Workspace path: `C:\Users\georgem\source\repos\aurora_invest_app`

### Before Starting Work
```bash
# 1. Ensure you're on the latest main or have rebased
git checkout main
git pull origin main

# 2. Install dependencies
npm install

# 3. Verify build
npm run build

# 4. Verify tests (if they exist)
npm test

# 5. Create your feature branch
git checkout -b feature/[agent-number]-[task-name]
```

## Reality Check Commands

Always run these to verify current state:
```bash
git status -sb          # Current branch and status
git branch -a          # All branches
git log --oneline -n 5 # Recent commits
npm run build          # Build status (after npm install)
npm test               # Test status (after npm install)
```

---

**Remember**: Ground truth over narrative. Always run actual commands.

## Active Manager Reality – 2025-12-05

- **Branch**: `cursor/setup-active-manager-contracts-and-reality-snapshot-gpt-5.1-codex-high-a4c9` with local edits to `lib/domain/AnalysisTypes.ts` plus new workflow contracts (`agent-workflow/GLOBAL_RULES.md`, `agent-workflow/contracts/ActiveManagerContracts.ts`).
- **Types (`AnalysisTypes.ts`)**: Now exports `ActiveManagerTimeframe` and `ActiveManagerRecommendation` which reuse the existing `PortfolioAction` type from `lib/domain/portfolioEngine.ts`. These additions do not change other exports or consumers yet.
- **Domain Engine (`auroraEngine.ts`)**: No Active Manager hooks exist today; engine remains pure analytics and compiles cleanly after the new type exports (verified via `npm run build`).
- **Portfolio Types**: `PortfolioAction`, `PortfolioActionSuggestion`, and `PortfolioContext` continue to live in `portfolioEngine.ts`/`AnalysisTypes.ts`, and are re-exported for Active Manager consumers through `agent-workflow/contracts/ActiveManagerContracts.ts`.
- **Build**: `npm run build` (Next.js 14.2.28) succeeds. Only known warning is the pre-existing `metadataBase` notice from Next.js metadata generation; no TypeScript errors.
- **Tests**: `npm test` (Vitest) executes 5 suites / 81 tests and passes. No skipped suites or “No test suite found” issues observed; this reflects the pre-feature baseline.

