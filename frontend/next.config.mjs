/** @type {import('next').NextConfig} */
const nextConfig = {
    // Proxy API requests to the Express backend during development
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3000/:path*',
      },
    ];
  },
};

export default nextConfig;
