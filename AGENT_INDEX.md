# 📑 Agent Documentation Index

Quick reference guide for AI agents working on this codebase. Start here to find the right documentation.

## 🎯 First Time Here?

**START HERE:** **[AGENT_ASSIGNMENTS.md](./AGENT_ASSIGNMENTS.md)** - **Simple list: Your agent number and file to read.**

**Then Read:** **[AGENT_ROLES.md](./AGENT_ROLES.md)** - Hard constraints and verification requirements.

**New to this codebase?** Read in this order:

1. **[AGENT_ROLES.md](./AGENT_ROLES.md)** - **Your role assignment and hard constraints** ⚠️
2. **[AGENT_PROMPTS.md](./AGENT_PROMPTS.md)** - Your specific agent prompt (based on role)
3. **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture and design
4. **[MODULE_BOUNDARIES.md](./MODULE_BOUNDARIES.md)** - Module boundaries and dependencies

## 📚 Documentation Map

### For Understanding the System
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Complete system architecture, data flows, module details
- **[MODULE_BOUNDARIES.md](./MODULE_BOUNDARIES.md)** - What each module can/cannot do, dependency rules

### For Writing Code
- **[AGENT_ASSIGNMENTS.md](./AGENT_ASSIGNMENTS.md)** - **Simple agent list** ⭐ **START HERE**
- **[AGENT_ROLES.md](./AGENT_ROLES.md)** - **Hard constraints and verification** ⚠️
- **[AGENT_PROMPTS.md](./AGENT_PROMPTS.md)** - **Ready-to-use prompts for specific agent roles** ⭐
- **[AGENT_GUIDE.md](./AGENT_GUIDE.md)** - Mega prompts for common tasks, step-by-step guides
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Code style, patterns, conventions, best practices

### For Quick Reference
- **[README.md](./README.md)** - Project overview, features, setup instructions
- **[GIT_SETUP.md](./GIT_SETUP.md)** - Git remote configuration and workflow
- **[VERIFICATION_CHECKLIST.md](./VERIFICATION_CHECKLIST.md)** - Documentation verification checklist
- **This file** - Documentation index

## 🔍 Find What You Need

### "I need to add a new analysis dimension"
→ See **[AGENT_GUIDE.md](./AGENT_GUIDE.md)** → "Task: Add a New Analysis Dimension"

### "I need to integrate a real API"
→ See **[AGENT_GUIDE.md](./AGENT_GUIDE.md)** → "Task: Integrate a Real Market Data API"

### "I need to understand the data flow"
→ See **[ARCHITECTURE.md](./ARCHITECTURE.md)** → "Data Flow" section

### "I need to know where to put my code"
→ See **[MODULE_BOUNDARIES.md](./MODULE_BOUNDARIES.md)** → "Module Map" and "What Each Module CANNOT Do"

### "I need coding patterns and conventions"
→ See **[CONTRIBUTING.md](./CONTRIBUTING.md)** → All sections

### "I need to modify the analysis engine"
→ See **[AGENT_GUIDE.md](./AGENT_GUIDE.md)** → "Task: Modify Analysis Heuristics"
→ See **[ARCHITECTURE.md](./ARCHITECTURE.md)** → "Domain Layer" section

### "I need to create a new UI component"
→ See **[AGENT_GUIDE.md](./AGENT_GUIDE.md)** → "Task: Add a New UI Component"
→ See **[CONTRIBUTING.md](./CONTRIBUTING.md)** → "Component Patterns" section

## 🎯 Common Workflows

### Adding a Feature
1. Read **[MODULE_BOUNDARIES.md](./MODULE_BOUNDARIES.md)** to understand where code should live
2. Read **[AGENT_GUIDE.md](./AGENT_GUIDE.md)** for task-specific instructions
3. Follow patterns in **[CONTRIBUTING.md](./CONTRIBUTING.md)**
4. Reference **[ARCHITECTURE.md](./ARCHITECTURE.md)** for system design

### Fixing a Bug
1. Understand the module boundaries (see **[MODULE_BOUNDARIES.md](./MODULE_BOUNDARIES.md)**)
2. Check error handling patterns (see **[CONTRIBUTING.md](./CONTRIBUTING.md)** → "Error Handling")
3. Ensure no cross-boundary violations

### Refactoring
1. Review **[ARCHITECTURE.md](./ARCHITECTURE.md)** to understand current design
2. Check **[MODULE_BOUNDARIES.md](./MODULE_BOUNDARIES.md)** to ensure boundaries are respected
3. Follow patterns in **[CONTRIBUTING.md](./CONTRIBUTING.md)**

## 🚨 Critical Rules (Quick Reference)

1. **Domain Engine is PURE** - No side effects, no API calls, no React
2. **Types in AnalysisTypes.ts** - All domain types defined there
3. **Service Layer for Data** - All data fetching through service layer
4. **Framework Language Only** - No personalized financial advice
5. **Error Handling** - User-friendly messages, graceful degradation

For detailed rules, see **[AGENT_GUIDE.md](./AGENT_GUIDE.md)** → "Critical Rules"

## 📂 Key Files Reference

### Domain Layer
- `lib/domain/AnalysisTypes.ts` - All type definitions
- `lib/domain/auroraEngine.ts` - Pure analysis engine (JSDoc documented)

### Service Layer
- `lib/services/marketDataService.ts` - Data abstraction (interface + implementations)

### Application Layer
- `app/page.tsx` - Main orchestration

### Presentation Layer
- `components/analysis-dashboard.tsx` - Results display
- `components/stock-form.tsx` - User input form
- `components/*-card.tsx` - Individual analysis cards

## ✅ Pre-Submit Checklist

Before submitting changes, verify:

- [ ] Read relevant documentation (this index helps you find it)
- [ ] Followed module boundaries (see **[MODULE_BOUNDARIES.md](./MODULE_BOUNDARIES.md)**)
- [ ] Followed code patterns (see **[CONTRIBUTING.md](./CONTRIBUTING.md)**)
- [ ] No domain engine side effects (see **[ARCHITECTURE.md](./ARCHITECTURE.md)**)
- [ ] User-friendly error handling (see **[CONTRIBUTING.md](./CONTRIBUTING.md)**)
- [ ] Framework language only (no personalized advice)

---

**Last Updated**: 2024
**Maintained By**: AuroraInvest Team

