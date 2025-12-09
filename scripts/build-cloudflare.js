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

// Run Next.js build
console.log('\n🏗️  Building Next.js with environment variables...\n');
execSync('next build', {
  stdio: 'inherit',
  env: process.env
});

// Remove cache directory (cross-platform)
const cacheDir = path.join(__dirname, '..', '.next', 'cache');
if (fs.existsSync(cacheDir)) {
  fs.rmSync(cacheDir, { recursive: true, force: true });
  console.log('\n🗑️  Removed .next/cache directory\n');
}

console.log('\n✅ Build complete!\n');
