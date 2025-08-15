/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: [],
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/writing',
        permanent: false,
      },
    ]
  },
};

export default nextConfig;