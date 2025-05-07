import MiniCssExtractPlugin from "mini-css-extract-plugin";
import { Configuration } from 'webpack';

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config : Configuration ) => {
    config.plugins = config.plugins || [];
    config.plugins.push(new MiniCssExtractPlugin());
    return config;
  },
  images: {
    remotePatterns: [{
      protocol: 'https',
      hostname: 'cdn.sanity.io',
      port: '',
      pathname: '/images/**',
    }],
  },
};

export default nextConfig;
