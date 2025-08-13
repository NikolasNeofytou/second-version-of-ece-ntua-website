import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'source.unsplash.com' },
  { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
  { protocol: 'https', hostname: 'photos.google.com' },
  { protocol: 'https', hostname: 'play-lh.googleusercontent.com' },
  { protocol: 'https', hostname: 'substackcdn.com' },
  { protocol: 'https', hostname: 'cdn.substack.com' },
    ],
  },
};

export default nextConfig;
