# How to Use Agent Prompts in Cursor

## Overview

Each agent prompt file (AGENT1_PROMPT.md through AGENT7_PROMPT.md) contains:
- **CRITICAL section**: Actual codebase patterns to follow (function signatures, naming conventions, implementation details)
- **File references**: Specific files to study before starting
- **Key patterns**: Must-follow rules from existing code
- **Workflow**: Git commands, build verification, reality snapshot

## Using the Prompts

### Step 1: Copy the entire prompt
Open the relevant AGENT*_PROMPT.md file and copy the entire content (including the triple backticks).

### Step 2: Add your specific task
Replace `[DESCRIBE YOUR TASK HERE]` with your actual task description. For example:

**Agent 1 (Domain) task example:**
```
Your task: Add a new risk scoring function that evaluates dividend sustainability
- Calculate dividend coverage ratio (earnings / dividends)
- Calculate payout ratio consistency over 5 years
- Return a score from 0-100 where >70 is sustainable
```

**Agent 3 (UI) task example:**
```
Your task: Create a dividend dashboard component
- Display dividend history table (date, amount, yield)
- Show dividend sustainability score with color-coded badge
- Add interactive chart showing dividend growth over time
```

**Agent 7 (Portfolio) task example:**
```
Your task: Add portfolio tracking and management system
- Track holdings (ticker, shares, cost basis, purchase date)
- Calculate portfolio metrics (value, gain/loss, beta, volatility)
- Display portfolio dashboard with holdings table
- Show portfolio context when analyzing stocks
- Detect concentration risk and suggest actions
```

### Step 3: Paste into Cursor
Paste the complete prompt (with your task filled in) into Cursor's agent interface.

### Step 4: Agent executes
The agent will:
1. Read the CRITICAL files listed in the prompt
2. Understand existing patterns (function signatures, naming, styling)
3. Create a feature branch
4. Implement your task following existing patterns
5. Run build and tests
6. Provide reality snapshot (git status, test results, build output)

## Why These Prompts Work

### Before Enhancement (didn't work):
```
Files to study:
- lib/domain/auroraEngine.ts
```

**Problem**: Agent saw file name but didn't know what patterns to follow.

### After Enhancement (works):
```
1. lib/domain/auroraEngine.ts
   - Main export: analyzeStock(profile, stock, options) → AnalysisResult
   - Pure helper functions: calculateFundamentalsQualityScore, classifyFundamentals
   - All functions are PURE (deterministic, no side effects)
   - Follow naming: calculateX, classifyY, generateZ, detectW
```

**Solution**: Agent sees actual function signatures and naming conventions to match.

## Agent Specializations

- **Agent 1**: Domain logic (pure functions, calculations, scoring)
- **Agent 2**: Services (API integration, data fetching, localStorage)
- **Agent 3**: UI components (Card primitives, Radix UI, Tailwind CSS)
- **Agent 4**: Orchestration (app/page.tsx, caching, queuing, progressive loading)
- **Agent 5**: Testing (Vitest, factory helpers, real assertions, mocking)
- **Agent 6**: Historical analysis (Recharts, time series, trend detection)
- **Agent 7**: Portfolio management (cross-layer feature spanning domain/service/UI)

## Example Workflow

```bash
# 1. Start with Agent 7 prompt for portfolio feature
# Copy AGENT7_PROMPT.md content

# 2. Replace [DESCRIBE YOUR TASK HERE] with:
Your task: Add portfolio tracking and management system
- Track holdings (ticker, shares, cost basis, purchase date)
- Calculate portfolio metrics (value, gain/loss, beta, volatility)
- Display portfolio dashboard with holdings table

# 3. Paste into Cursor agent

# 4. Agent creates feature branch and implements:
- lib/domain/portfolioEngine.ts (pure functions)
- lib/services/portfolioService.ts (localStorage service)
- components/portfolio-dashboard.tsx (UI)
- Tests for both domain and service layers

# 5. Agent provides reality snapshot:
## feature/agent7-portfolio-management...main
M lib/domain/portfolioEngine.ts
M lib/services/portfolioService.ts
M components/portfolio-dashboard.tsx
M lib/domain/__tests__/portfolioEngine.test.ts

npm run build ✓ 0 errors
npm test ✓ 18 tests passing
```

## Tips

1. **Be specific with tasks**: Instead of "improve risk analysis", say "add dividend sustainability scoring with coverage ratio and payout consistency"

2. **Match agent specialization**: Don't ask Agent 1 (domain) to create UI components - use Agent 3 for that

3. **Reference existing patterns**: The CRITICAL sections show you what patterns exist - reference them in your task description

4. **One feature per agent**: Each agent should implement one cohesive feature, not multiple unrelated changes

5. **Verify snapshots**: Always check the reality snapshot the agent provides (git status, build output, test results)

## Current Status

- ✅ **Agents 1-6**: Complete and merged to main
- 🚧 **Agent 7**: Portfolio management - ready to implement

All prompts enhanced with actual codebase context (function signatures, patterns, implementation details).
