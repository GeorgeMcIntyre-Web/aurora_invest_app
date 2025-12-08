const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed 'output: export' - Cloudflare Pages handles Next.js natively
  // Static export doesn't support API routes which we need for:
  // - /api/search-stocks (Yahoo Finance search)
  // - /api/ai-analysis (DeepSeek verification)
  experimental: {
    outputFileTracingRoot: path.join(__dirname, '../'),
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: { unoptimized: true },
  trailingSlash: true,
};

module.exports = nextConfig;
