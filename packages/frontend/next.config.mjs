/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '',
  trailingSlash: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
