/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    SOLANA_NETWORK: process.env.SOLANA_NETWORK,
  },
};

module.exports = nextConfig;
