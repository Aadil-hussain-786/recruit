import type { NextConfig } from "next";
import withBundleAnalyzer from '@next/bundle-analyzer';

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  compress: true,
  images: {
    formats: ['image/webp', 'image/avif'],
  },
  /* config options here */
};

export default bundleAnalyzer(nextConfig);
