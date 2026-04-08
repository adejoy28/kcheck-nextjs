/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  // Prevent mysql2 from being bundled for client-side (Next.js 14.2.35 requires experimental)
  experimental: {
    serverComponentsExternalPackages: ['mysql2', 'bcryptjs'],
  },
  webpack: (config, { isServer }) => {
    // Handle node: scheme imports
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false,
        dns: false,
        crypto: false,
        stream: false,
        'diagnostics_channel': false,
      };

      // Add node: scheme handling
      config.resolve.alias = {
        ...config.resolve.alias,
        'node:diagnostics_channel': false,
      };

      // Externalize mysql2 completely for client builds
      config.externals = {
        ...config.externals,
        mysql2: 'mysql2',
        'mysql2/promise': 'mysql2/promise',
      };
    }

    return config;
  },
};

export default nextConfig;
