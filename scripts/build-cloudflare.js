#!/usr/bin/env node

/**
 * Cloudflare Pages build script
 * Loads environment variables from .env.production and runs Next.js build
 * 
 * IMPORTANT: Environment variables set externally (e.g., GitHub Actions)
 * take precedence over .env.production values.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Load .env.production (only if not already set in environment)
const envPath = path.join(__dirname, '..', '.env.production');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const lines = envContent.split('\n');

  lines.forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('=');
      if (key && value) {
        const trimmedKey = key.trim();
        // Don't overwrite existing env vars (allows GitHub Actions to override)
        if (process.env[trimmedKey] === undefined) {
          process.env[trimmedKey] = value.trim();
          console.log(`Loaded from .env.production: ${trimmedKey}`);
        } else {
          console.log(`Using existing env var: ${trimmedKey}=${process.env[trimmedKey]}`);
        }
      }
    }
  });
}

// Run Next.js build (will create 'out' directory for static export)
console.log('\n🏗️  Building Next.js static export with environment variables...\n');
execSync('next build', {
  stdio: 'inherit',
  env: process.env
});

console.log('\n✅ Static export complete!\n');
