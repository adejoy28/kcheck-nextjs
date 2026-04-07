/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    // Handle node: protocol imports properly
    config.resolve.extensionAlias = {
      '.js': ['.js', '.ts', '.tsx'],
    };

    // Handle node: imports by stripping the prefix
    config.resolve.alias = {
      ...config.resolve.alias,
      "node:diagnostics_channel": "diagnostics_channel",
    };

    // Ignore node: modules that aren't available
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "node:diagnostics_channel": false,
    };

    // Handle MySQL2 for client-side build
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        "mysql2": false,
        "mysql2/promise": false,
      };
    }

    return config;
  },
};

export default nextConfig;
