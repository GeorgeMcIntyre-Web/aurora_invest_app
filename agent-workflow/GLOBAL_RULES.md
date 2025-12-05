# 🌐 Agent Global Rules

These rules apply to every agent working in the AuroraInvest workspace. Keep them visible while you work and verify compliance before handing off any work.

1. **Test Files Must Be Real**
   - Every test file you touch must contain **at least one** `describe`, **at least one** `it`/`test`, and **at least one** real `expect` assertion.
   - Delete scaffolds or convert them into runnable suites before you finish.

2. **"No Test Suite Found" Is Never Acceptable**
   - Running `npm test`/`npx vitest run` must execute real suites.
   - If Vitest reports "No test suite found", create or fix the suites immediately.

3. **Skipped Tests Need Documentation**
   - Any skipped/disabled test must include a short reason and a `TODO` describing what is required to re-enable it.
   - Example: `it.skip('...', () => { /* TODO(agent-name): reason */ })`

4. **Tool/Framework Blame Requires Proof**
   - Before blaming the framework/tooling, create a minimal 10–20 line reproduction test demonstrating the issue.
   - Document the exact repro steps and keep the file in the repo until the issue is resolved.

Always err on the side of adding more real coverage and fewer placeholders. If you are unsure whether a change violates these rules, assume it does and fix it before handing off.
