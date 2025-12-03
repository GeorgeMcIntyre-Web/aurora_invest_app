# 🔧 Git Setup Quick Reference

Quick reference for agents to verify and configure git remote.

## ✅ Current Configuration

**Repository**: `https://github.com/GeorgeMcIntyre-Web/aurora_invest_app.git`  
**Remote Name**: `origin`  
**Main Branch**: `main`  
**Workspace**: `C:\Users\georgem\source\repos\aurora_invest_app`

## 🚀 Quick Setup Commands

### Verify Remote is Set

```bash
cd C:\Users\georgem\source\repos\aurora_invest_app
git remote -v
```

**Expected Output:**
```
origin  https://github.com/GeorgeMcIntyre-Web/aurora_invest_app.git (fetch)
origin  https://github.com/GeorgeMcIntyre-Web/aurora_invest_app.git (push)
```

### If Remote is Missing or Wrong

```bash
# If remote exists but is wrong:
git remote set-url origin https://github.com/GeorgeMcIntyre-Web/aurora_invest_app.git

# If remote doesn't exist:
git remote add origin https://github.com/GeorgeMcIntyre-Web/aurora_invest_app.git

# Verify:
git remote -v
```

### Get Latest Code

```bash
# Fetch latest from remote
git fetch origin

# Pull latest changes
git pull origin main

# Check status
git status
```

### Standard Workflow

```bash
# 1. Verify remote
git remote -v

# 2. Get latest code
git fetch origin
git pull origin main

# 3. Create feature branch
git checkout -b feature/[descriptive-name]

# 4. Make your changes
# ... work on your task ...

# 5. Stage changes
git add .

# 6. Commit
git commit -m "feat(scope): description of changes"

# 7. Push to remote
git push origin feature/[descriptive-name]
```

## 🔍 Troubleshooting

### "Remote not found" Error

```bash
# Check if remote exists
git remote -v

# If empty, add remote:
git remote add origin https://github.com/GeorgeMcIntyre-Web/aurora_invest_app.git

# Verify
git remote -v
```

### "Authentication failed" Error

- Ensure you have access to the repository
- If using SSH, ensure SSH keys are configured
- If using HTTPS, you may need to use a personal access token

### "Branch not found" Error

```bash
# Check available branches
git branch -r

# If main branch doesn't exist, check for master:
git pull origin master
```

## 📝 Commit Message Format

```
type(scope): short description

Longer description if needed
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `refactor`: Code restructuring
- `test`: Adding tests

**Examples:**
```
feat(analysis): add ESG score to analysis results
fix(ui): handle missing technical data gracefully
docs(agent): add agent guide for new analysis dimensions
```

---

**Last Updated**: 2024  
**Repository**: https://github.com/GeorgeMcIntyre-Web/aurora_invest_app.git

