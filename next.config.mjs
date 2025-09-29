import CopyPlugin from 'copy-webpack-plugin';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.plugins.push(
      new CopyPlugin({
        patterns: [
          {
            from: path.dirname(require.resolve('@ffmpeg/core')),
            to: path.join(process.cwd(), 'public/ffmpeg'),
            filter: (resourcePath) =>
              resourcePath.endsWith('.js') || resourcePath.endsWith('.wasm'),
          },
        ],
      })
    );
    return config;
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cvcdhnkpgnelczsgctlc.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'dnznrvs05pmza.cloudfront.net',
      },
    ],
  },
};

export default nextConfig;
