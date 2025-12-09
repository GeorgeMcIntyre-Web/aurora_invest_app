#!/usr/bin/env node

/**
 * Cloudflare Pages build script
 * Loads environment variables from .env.production and runs Next.js build
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Load .env.production
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
        process.env[key.trim()] = value.trim();
        console.log(`Loaded: ${key.trim()}`);
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
