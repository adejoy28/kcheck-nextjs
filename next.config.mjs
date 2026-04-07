/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    // Handle node: protocol for built-in modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "node:diagnostics_channel": false,
      "diagnostics_channel": false,
    };

    // Handle node: imports by stripping the prefix
    config.resolve.alias = {
      ...config.resolve.alias,
      "node:diagnostics_channel": "diagnostics_channel",
    };

    return config;
  },
};

export default nextConfig;
