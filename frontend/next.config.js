/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true, // Required for static export
    domains: [
      // TODO: 用户需要添加 Cloudflare R2 域名
      'your-bucket.r2.dev',
      // 其他图片域名
    ],
  },
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
      '@react-native-async-storage/async-storage': false,
    };
    config.externals.push('pino-pretty', 'encoding');

    // Disable webpack cache for Cloudflare Pages
    config.cache = false;

    return config;
  },
};

module.exports = nextConfig;
