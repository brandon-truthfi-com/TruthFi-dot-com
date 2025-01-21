/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
      ignoreDuringBuilds: true, // Skip ESLint checks during builds
    },
    typescript: {
      ignoreBuildErrors: true, // Skip TypeScript errors during builds
    },
  };
  
  export default nextConfig;
  