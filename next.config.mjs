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
    }

    return config;
  },
};

export default nextConfig;
