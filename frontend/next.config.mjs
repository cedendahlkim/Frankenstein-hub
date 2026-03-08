/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/agents/:path*',
        destination: 'http://localhost:8081/agents/:path*',
      },
    ];
  },
};

export default nextConfig;
