/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.externals.push({
        mongodb: 'commonjs mongodb',
      });
    }
    return config;
  },
};


export default nextConfig;
