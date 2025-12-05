# Start Here - Agent Prompts for Aurora Invest App

## Current Status

✅ **Agents 1-6**: Complete and merged to main
🚧 **Agent 7**: Portfolio Management - Ready to implement

## How to Use Agent Prompts

### For Agent 7 (Portfolio) - Ready Now!

**File**: [AGENT7_PROMPT.md](AGENT7_PROMPT.md)

**This prompt is COMPLETE** - just copy the entire file contents and paste into Cursor:

1. Open [AGENT7_PROMPT.md](AGENT7_PROMPT.md)
2. Copy everything (lines 1-78)
3. Paste into Cursor agent interface
4. Agent will immediately start implementing portfolio management

**What Agent 7 will create**:
- `lib/domain/portfolioEngine.ts` - Pure portfolio calculation functions
- `lib/services/portfolioService.ts` - localStorage persistence service
- `lib/domain/__tests__/portfolioEngine.test.ts` - Domain tests
- `lib/services/__tests__/portfolioService.test.ts` - Service tests
- `components/portfolio-dashboard.tsx` - Portfolio UI
- `app/portfolio/page.tsx` - Portfolio page

---

### For Future Features (Agents 1-6)

Since Cursor limits you to **6 agents at a time** and you've already used all 6 slots for Agents 1-6, you'll need to use these prompts **one at a time** for new features.

**Template Prompts** (need task filled in):
- [AGENT1_PROMPT.md](AGENT1_PROMPT.md) - Domain logic
- [AGENT2_PROMPT.md](AGENT2_PROMPT.md) - Services/APIs
- [AGENT3_PROMPT.md](AGENT3_PROMPT.md) - UI components
- [AGENT4_PROMPT.md](AGENT4_PROMPT.md) - App orchestration
- [AGENT5_PROMPT.md](AGENT5_PROMPT.md) - Testing
- [AGENT6_PROMPT.md](AGENT6_PROMPT.md) - Charts/historical

**Ready-to-Use Prompts** (task already filled in):
- [READY_TO_USE_PROMPTS.md](READY_TO_USE_PROMPTS.md) - 7 example tasks

---

## Quick Reference

### Using a Template Prompt

1. Open the AGENT*_PROMPT.md file
2. Find the line: `Your task: [DESCRIBE YOUR TASK HERE]`
3. Replace with your specific task (be concrete!)
4. Copy entire file contents
5. Paste into Cursor

**Example replacement**:
```
Your task: Add dividend sustainability scoring system
- Calculate dividend coverage ratio (earnings / dividends paid)
- Calculate payout ratio consistency over past 5 years
- Evaluate dividend growth rate (CAGR over 5 years)
- Return dividendSustainabilityScore 0-100
```

### Using a Ready-to-Use Prompt

1. Open [READY_TO_USE_PROMPTS.md](READY_TO_USE_PROMPTS.md)
2. Find the section for the feature you want (e.g., "Agent 1: Add Dividend Sustainability Scoring")
3. Copy the entire code block
4. Paste into Cursor
5. Done - agent starts immediately!

---

## What's in Each Agent Prompt?

Every prompt contains:

✅ **CRITICAL section** - Actual codebase patterns to follow
✅ **Function signatures** - Real function names and return types
✅ **Implementation details** - Specific patterns from existing code
✅ **Test patterns** - Factory helpers, assertion examples
✅ **Workflow** - Git commands, build verification, reality snapshot

This means Cursor agents will:
- Read the actual patterns from your codebase
- Match existing naming conventions (calculateX, classifyY, etc.)
- Follow component patterns (Card primitives, severityStyles, cn() helper)
- Write tests with real assertions (not scaffolds)
- Provide reality snapshot when done (git status, build output, test results)

---

## Current Priority: Agent 7

Since you already completed Agents 1-6, **start with Agent 7 (Portfolio Management)**:

1. Open [AGENT7_PROMPT.md](AGENT7_PROMPT.md)
2. Copy all 78 lines
3. Paste into Cursor
4. Agent will create portfolio tracking system with:
   - Holdings management (ticker, shares, cost basis)
   - Portfolio metrics (value, gain/loss, beta, volatility)
   - Dashboard UI with holdings table
   - Concentration risk detection
   - Full test coverage

---

## Files Overview

| File | Purpose |
|------|---------|
| **AGENT7_PROMPT.md** | ⭐ Use this now for portfolio feature |
| AGENT1_PROMPT.md | Template for domain logic tasks |
| AGENT2_PROMPT.md | Template for service/API tasks |
| AGENT3_PROMPT.md | Template for UI component tasks |
| AGENT4_PROMPT.md | Template for app orchestration tasks |
| AGENT5_PROMPT.md | Template for testing tasks |
| AGENT6_PROMPT.md | Template for chart/historical tasks |
| READY_TO_USE_PROMPTS.md | 7 complete examples with tasks filled in |
| HOW_TO_USE_AGENT_PROMPTS.md | Detailed guide with examples |
| AGENT_DESCRIPTIONS.md | Quick reference - what each agent does |

---

## Next Steps

1. **Now**: Use [AGENT7_PROMPT.md](AGENT7_PROMPT.md) to implement portfolio management
2. **Later**: When you need a new feature:
   - Choose the appropriate agent (1-6) based on the layer (domain/service/UI/orchestration/test/chart)
   - Copy the template prompt
   - Replace `[DESCRIBE YOUR TASK HERE]` with your specific task
   - Or use one of the ready-to-use examples from READY_TO_USE_PROMPTS.md

---

**Last Updated**: 2025-12-03
