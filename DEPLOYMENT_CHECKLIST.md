# Cloudflare Pages Deployment Checklist

## ✅ Environment Variables Setup

Cloudflare Pages does NOT read `.env.production` automatically. You must configure environment variables in the UI.

### Required Environment Variables

Go to: **Cloudflare Pages → Settings → Environment Variables → Production**

#### 1. Market Data Provider (Plaintext)
- **Variable name:** `NEXT_PUBLIC_MARKET_DATA_PROVIDER`
- **Value:** `yahoo`
- **Type:** Plaintext
- **Environment:** Production

#### 2. DeepSeek API Key (Secret)
- **Variable name:** `DEEPSEEK_API_KEY`
- **Value:** `sk-e2cb09bf9123495f8220731144652b2c`
- **Type:** **Encrypt** (Secret)
- **Environment:** Production

### After Adding Variables

1. Click **"Save"** button
2. Go to **Deployments** tab
3. Click **"Retry deployment"** on the latest build
4. Wait 2-3 minutes for deployment to complete

## ✅ Verification Steps

After deployment completes, test on https://aurorainvest.me:

1. **Check "Live Data" badge** appears (not "Demo Mode")
2. **Test stock search:**
   - Type any ticker (lowercase is OK, will auto-uppercase)
   - Select from autocomplete
3. **Test analysis:**
   - Click "Analyze Stock"
   - Verify real Yahoo Finance data loads
4. **Test AI verification:**
   - Click "Run Deep Verification"
   - Should work without 500 error
5. **Test responsive layout:**
   - Resize browser or test on mobile
   - Investment profile cards should stack on mobile

## 🚨 Common Issues

### Issue: Still showing "Demo Mode"
**Fix:** Environment variable not saved or deployment not triggered
- Verify you clicked "Save" in Cloudflare UI
- Trigger a new deployment
- Hard refresh browser (Ctrl+Shift+F5)

### Issue: "No deployment available"
**Fix:** Build failed or didn't trigger
- Check build logs in Deployments tab
- Ensure environment variables are set correctly
- Try manual retry deployment

### Issue: AI verification 500 error
**Fix:** DeepSeek API key not configured
- Add `DEEPSEEK_API_KEY` as encrypted secret
- Redeploy

## 📝 Notes

- `.env.production` file is for documentation only
- Cloudflare Pages requires manual environment variable configuration
- Changes to environment variables require redeployment to take effect
- Use "Encrypt" for sensitive values like API keys
