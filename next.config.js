/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  webpack(config, options) {
    config.module.rules.push({
      test: /\.mp3$/,
      use: {
        loader: 'file-loader',
      },
    });
    return config;
  },
  basePath:process.env.NODE_ENV==="development"?"":"/firework-love-nextjs"

}

module.exports = nextConfig
