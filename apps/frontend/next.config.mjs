/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.NEXT_STANDALONE ? "standalone" : undefined,
};

export default nextConfig;
