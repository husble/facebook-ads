/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Recommended for the `pages` directory, default in `app`.
  experimental: {
    appDir: true
  },
  env: {
    API_HASURA: process.env.API_HASURA,
    PASS_HASURA: process.env.PASS_HASURA,
    API_NODE: process.env.API_NODE
  },
  images: {
    domains: ["cdn.shopify.com"]
  }
};

module.exports = nextConfig;
