# Implement NOW - Follow-Up Prompt

Use this prompt when an agent has analyzed the task but hasn't started implementing yet.

---

## The Prompt

```
You've reviewed the requirements and patterns. Now IMPLEMENT the solution.

DO NOT just describe what you would do.
DO NOT just analyze the files.
DO NOT ask for clarification.

START IMPLEMENTING NOW:

1. Create the files listed in your task
2. Write the actual code following the patterns you studied
3. Write the tests with real assertions
4. Run npm run build (must pass)
5. Run npm test (must pass)
6. Provide the reality snapshot:
   - git status -sb
   - git log --oneline -n 1
   - npm run build output
   - npm test output

IMPORTANT:
- Write COMPLETE implementations, not scaffolds
- Write REAL test assertions with expect(), not TODO comments
- Follow the EXACT patterns from the files you studied
- Use the EXACT function signatures and naming conventions shown
- Match the EXACT coding style (JSDoc, error handling, etc.)

You have all the information you need. Start writing code NOW.
```

---

## When to Use This

Use this prompt when the agent:
- Says "I've reviewed the files and I'm ready to start"
- Says "Let me know when you'd like me to implement"
- Describes what they would do but doesn't actually do it
- Asks for clarification after you've given them everything

## How to Use

1. Copy the entire prompt above (between the triple backticks)
2. Paste it as a reply to the agent's message
3. The agent should immediately start creating files and writing code

---

## Example Conversation

**Agent**: "I've reviewed the agent briefs, prompt pack, and the key domain files. Patterns are clear. Ready to start once you specify the concrete domain task."

**You**: [Paste the IMPLEMENT NOW prompt]

**Agent**: [Creates lib/domain/portfolioEngine.ts, writes actual code, runs tests, provides git status]

---

**Last Updated**: 2025-12-03
