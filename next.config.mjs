/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  // Prevent mysql2 from being bundled for client-side
  serverExternalPackages: ['mysql2'],
  webpack: (config, { isServer }) => {
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
