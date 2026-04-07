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

    // Handle node: imports by stripping the prefix for common Node.js modules
    const nodeModules = [
      'diagnostics_channel',
      'events',
      'stream',
      'util',
      'buffer',
      'crypto',
      'net',
      'tls',
      'fs',
      'path',
      'os',
      'url',
      'querystring',
      'zlib',
      'http',
      'https',
      'assert'
    ];

    config.resolve.alias = {
      ...config.resolve.alias,
      ...Object.fromEntries(
        nodeModules.map(module => [`node:${module}`, module])
      ),
    };

    // Handle MySQL2 for client-side build
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        "mysql2": false,
        "mysql2/promise": false,
        "fs": false,
        "net": false,
        "tls": false,
        "crypto": false,
        "stream": false,
        "url": false,
        "zlib": false,
        "http": false,
        "https": false,
        "assert": false,
        "os": false,
        "path": false,
      };
      
      // Exclude mysql2 from client bundle
      config.externals = {
        ...config.externals,
        'mysql2': 'mysql2',
        'mysql2/promise': 'mysql2/promise',
      };
    }

    return config;
  },
};

export default nextConfig;
