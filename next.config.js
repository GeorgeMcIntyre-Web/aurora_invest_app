const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
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
