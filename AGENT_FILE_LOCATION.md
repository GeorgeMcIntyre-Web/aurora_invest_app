# 📍 Agent File Location Guide

## Files Available on Main Branch

The following prompt files exist on the `main` branch:

1. **`MEGA_PROMPTS_3_AGENTS.md`** - Complete mega prompts for Agents 1, 4, and 5
2. **`AGENT_PROMPTS_COMPLETE.md`** - Complete prompts for all 6 agents
3. **`AGENT_PROMPTS_COPY_PASTE.md`** - Copy-paste ready prompts
4. **`AGENT_PROMPT_TEMPLATE.md`** - Template with full constraints

## If You're on a Cursor Branch

If you're on a `cursor/*` branch and can't find these files, they exist on `main`. Do one of the following:

### Option 1: Checkout Files from Main (Recommended)
```bash
# Get the files from main without switching branches
git checkout main -- MEGA_PROMPTS_3_AGENTS.md
git checkout main -- AGENT_PROMPTS_COMPLETE.md
```

### Option 2: Rebase onto Main
```bash
# Switch to main and get latest
git checkout main
git pull origin main

# Switch back to your branch
git checkout your-cursor-branch-name

# Rebase to get all latest files
git rebase main
```

### Option 3: View Files Directly from Main
```bash
# View the file content from main
git show main:MEGA_PROMPTS_3_AGENTS.md

# Or view the other file
git show main:AGENT_PROMPTS_COMPLETE.md
```

## Quick Verification

To verify files exist on main:
```bash
git ls-tree -r main --name-only | grep -i "mega\|prompt"
```

This should show:
- `AGENT_PROMPT_TEMPLATE.md`
- `AGENT_PROMPTS_COMPLETE.md`
- `AGENT_PROMPTS_COPY_PASTE.md`
- `AGENT_PROMPTS_READY.md`
- `AGENT_PROMPTS.md`
- `MEGA_PROMPTS_3_AGENTS.md`

## For "Ensure Verifiable Progress and Test Alignment" Agent

You're likely Agent 5 (Data & Testing Specialist). The mega prompt for you is in:
- **`MEGA_PROMPTS_3_AGENTS.md`** → Section "Agent 5: Data & Testing Specialist"

To get it:
```bash
git checkout main -- MEGA_PROMPTS_3_AGENTS.md
```

Then read the Agent 5 section.

