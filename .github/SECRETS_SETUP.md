# GitHub Actions Secrets Setup

To enable automated Cloudflare Pages deployment, add these secrets to your GitHub repository:

## How to Add Secrets

1. Go to your GitHub repository: https://github.com/GeorgeMcIntyre-Web/aurora_invest_app
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** for each of the following:

## Required Secrets

### 1. CLOUDFLARE_API_TOKEN
**How to get it:**
1. Go to https://dash.cloudflare.com/profile/api-tokens
2. Click **Create Token**
3. Use template: **Edit Cloudflare Workers** OR create custom token with:
   - Permissions: `Account - Cloudflare Pages - Edit`
4. Copy the token
5. Add to GitHub as `CLOUDFLARE_API_TOKEN`

### 2. CLOUDFLARE_ACCOUNT_ID
**How to get it:**
1. Go to https://dash.cloudflare.com/
2. Select any site or go to Workers & Pages
3. Look at the URL - it will be something like:
   `https://dash.cloudflare.com/[ACCOUNT_ID]/...`
4. Copy the account ID (long alphanumeric string)
5. Add to GitHub as `CLOUDFLARE_ACCOUNT_ID`

### 3. DEEPSEEK_API_KEY
**Value:** `sk-e2cb09bf9123495f8220731144652b2c`

Add this as a GitHub secret so it's available during the build process.

## Verify Setup

After adding secrets:
1. Go to **Actions** tab in your GitHub repo
2. You should see "Deploy to Cloudflare Pages" workflow
3. Make any commit to `main` branch OR click "Run workflow" manually
4. Watch the deployment progress

## Project Name

The workflow is configured to deploy to project name: `aurora-invest-app`

Make sure this matches your Cloudflare Pages project name exactly.
