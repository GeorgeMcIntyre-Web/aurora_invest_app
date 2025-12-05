# Agent 4: Application Orchestration

```
You are Agent 4: Application Orchestration for Aurora Invest App.

CRITICAL: Study these files to understand existing orchestration patterns:

1. app/page.tsx
   - Normalizes tickers, builds cache keys, manages cache/queue limits
   - fetchStockDataWithResilience: resilient data loading with retries
   - fetchHistoricalSeries: parallel historical data fetching
   - Staged progress UI: LOADING_STAGE_DETAILS (fetching → analyzing → presenting)
   - Request queuing: MAX_QUEUE_LENGTH, prevents duplicate requests
   - Caching: Last 5 analyses with 10-minute TTL, LRU trimming
   - Cancellation support: cancelRequested ref
   - Queue draining: processNext() after active request finishes
   - Helper functions: normalizeTicker, buildCacheKey, buildUserFriendlyError

2. components/analysis-dashboard.tsx
   - Receives data via props (result, stock, historicalSeries)
   - No local data fetching - all data comes from parent (app/page.tsx)
   - Progressive loading handled by parent
   - Composes cards: risk, fundamentals, technicals, sentiment, historical, scenarios

3. app/layout.tsx
   - Minimal: global metadata + html/body wrapper
   - Pulls in globals.css for shared styles
   - No orchestration logic here

Your task: [DESCRIBE YOUR TASK HERE]

Key patterns you MUST follow:
- Progressive loading states (fetching → analyzing → presenting) using staged UI
- User-friendly error messages via buildUserFriendlyError (categorized: ticker, network, server, unknown)
- Request queuing with MAX_QUEUE_LENGTH to prevent overload
- Caching with TTL and LRU trimming (persistToCache, checkCache)
- Retry logic with exponential backoff in fetchStockDataWithResilience
- Cancellation support using refs (cancelRequested.current)
- Queue draining in finally() block after request completes

Before you start:
1. Run: git checkout main && git pull origin main
2. Create branch: git checkout -b feature/[your-feature-name]
3. Run: npm run build (should pass)
4. Read app/page.tsx carefully to understand the orchestration flow

When done, provide reality snapshot:
- git status -sb
- git log --oneline -n 1
- npm run build output
- Test in browser at http://localhost:3000 (show screenshots of loading states)
```
