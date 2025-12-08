# Cloudflare Pages Build Configuration Fix

## Problem
API routes returning 404 because Cloudflare Pages is building as static export instead of using Next.js SSR mode.

## Solution: Update Cloudflare Pages Build Settings

### Steps:

1. Go to **Cloudflare Pages Dashboard** for aurorainvest.me
2. Navigate to **Settings → Builds & deployments**
3. Click **Edit** on "Build configuration"
4. Update the following settings:

### Required Settings:

**Framework preset:** Next.js (Static HTML Export) **→ Change to:** Next.js

**Build command:**
```bash
npm run build
```

**Build output directory:** (leave as default or set to `.next`)

**Root directory:** (leave empty or `/`)

**Environment variables** (already set, verify these exist):
- `NEXT_PUBLIC_MARKET_DATA_PROVIDER` = `yahoo`
- `DEEPSEEK_API_KEY` = `sk-e2cb09bf9123495f8220731144652b2c` (encrypted)
- `NODE_VERSION` = `18` or `20` (add if not exists)

### Important Notes:

- Do NOT use "Static HTML Export" preset
- Do NOT set build command to `next export`
- The `.next` directory contains the server-side functions needed for API routes

###Alternative: Use Vercel

If Cloudflare Pages doesn't properly support Next.js API routes:

1. Create account at https://vercel.com
2. Import GitHub repository
3. Vercel will auto-detect Next.js and configure everything
4. Add same environment variables in Vercel dashboard
5. Deploy

Vercel has native Next.js support (they created Next.js) and will work immediately.

## After Changing Settings:

1. Save changes
2. Go to **Deployments** tab
3. Click **Retry deployment** on latest build
4. Wait 3-5 minutes
5. Test: https://aurorainvest.me/api/test (should return JSON, not 404)
6. Test: https://aurorainvest.me/api/search-stocks?q=AAPL (should return stock data)
