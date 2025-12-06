# 📊 Current Reality Snapshot

**Last Updated:** 2025-12-06 (based on actual commands run in this session)

## Git State

- `git status -sb` → `## feature/ai-pipeline-portfolio-integration`
- `git branch -a` shows `main` plus the feature branch above, tracking `origin/main@4ef0e83`.
- Latest commit on main: `4ef0e83 feat: Add Cloudflare Pages Function for DeepSeek AI analysis`

## Build & Test Verification

```bash
$ npm run lint
✔ No ESLint warnings or errors

$ npm test
✓ 117 tests across 8 files (Vitest 4.0.15)

$ npm run build
✓ Next.js 14.2.28 build succeeded (static export for / and /portfolio)
```

## Deployment Pipeline

- `.github/workflows/deploy.yml` now blocks Cloudflare Pages deploys unless `npm ci`, `npm run lint`, `npm test`, and `npm run build` all pass.
- Secrets required for deployment: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `DEEPSEEK_API_KEY`.
- DeepSeek credentials (`DEEPSEEK_*`, `DEEP_VERIFICATION_TIMEOUT_MS`) are consumed by both the Next.js API route and the Cloudflare Function.

## Feature Reality

- Deep verification uses structured success/error envelopes end-to-end (service layer + UI cooldown handling).
- Analysis page automatically surfaces portfolio context, Active Manager guidance, and supports one-click portfolio updates.
- `/portfolio` renders Active Manager verdicts per holding and a bull/base/bear stress test driven by the scenario engine.

## How to Reproduce Locally

```bash
npm install
npm run lint
npm test
npm run build
npm run dev  # optional for manual verification
```

Keep this snapshot accurate by re-running the commands above whenever the repo state changes.
