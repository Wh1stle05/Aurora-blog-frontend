/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.aurorablog.me' },
      { protocol: 'https', hostname: 'api.aurorablog.me' },
    ],
  },
};

export default nextConfig;
