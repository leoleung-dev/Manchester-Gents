const allowedOriginsEnv = process.env.NEXTAUTH_URL
  ? process.env.NEXTAUTH_URL.split(',').map((url) => url.trim()).filter(Boolean)
  : ['http://localhost:3000'];

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      // Support multiple domains for NextAuth/Server Actions (comma-separated)
      allowedOrigins: allowedOriginsEnv
    }
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**'
      }
    ]
  }
};

module.exports = nextConfig;
