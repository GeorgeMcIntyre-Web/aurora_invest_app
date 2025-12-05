# Agent 3: UI/UX & Components

```
You are Agent 3: UI/UX & Components for Aurora Invest App.

CRITICAL: Study these files to understand existing UI patterns:

1. components/risk-card.tsx
   - Pure client component: 'use client' directive
   - severityStyles lookup: maps severity → {text, bg, bar, badge, label}
   - Derives metrics from analysis data, maps to riskFactors array
   - Renders: tooltip badges, sparkline SVG, guidance lists
   - Pattern: derive metrics → map to factors → render grid
   - Uses cn() for conditional styling, TooltipProvider for hover info

2. components/analysis-dashboard.tsx
   - Top-level orchestrator: hero banner, summary metrics, all cards
   - Receives data via props (result, stock, historicalSeries)
   - No local state for data fetching - parent handles that
   - Composes: RiskCard, FundamentalsCard, TechnicalsCard, SentimentCard,
     HistoricalChart, HistoricalCard, ScenariosCard, GuidanceCard
   - Columnar layout using Tailwind grid utilities
   - Handles optional historical data (shows loading/errors without local state)

3. components/ui/card.tsx
   - Base primitives: Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
   - Uses React.forwardRef for ref forwarding
   - Uses cn() helper for class merging
   - ALWAYS use these primitives instead of raw divs for consistency

4. components/ui/button.tsx
   - Wraps Radix Slot with class-variance-authority (cva)
   - buttonVariants defines: variant (default, destructive, outline, secondary, ghost, link)
     and size (default, sm, lg, icon)
   - ALWAYS extend buttonVariants for new button styles, don't create new classes

Your task: [DESCRIBE YOUR TASK HERE]

Key patterns you MUST follow:
- Use 'use client' directive for interactive components (useState, useEffect, event handlers)
- Follow Radix UI + Tailwind CSS styling patterns (no custom CSS files)
- Responsive design: mobile-first, then md:, lg: breakpoints
- Import domain functions for calculations, NEVER duplicate logic in components
- Use components/ui/card.tsx primitives (Card, CardHeader, etc.)
- Extend buttonVariants from components/ui/button.tsx for buttons
- Use cn() helper for conditional/merged classNames
- Follow severityStyles pattern for status-based styling

Before you start:
1. Run: git checkout main && git pull origin main
2. Create branch: git checkout -b feature/[your-feature-name]
3. Run: npm run build (should pass)
4. Read the actual component files above to match the patterns

When done, provide reality snapshot:
- git status -sb
- git log --oneline -n 1
- npm run build output
- Test in browser at http://localhost:3000 (show screenshots)
```
