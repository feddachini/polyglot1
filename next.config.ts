import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },

  webpack: (config) => {
    // Remove the problematic minify plugin from the plugins array
    config.plugins = config.plugins.filter((plugin: any) => 
      plugin.constructor.name !== 'MinifyWebpackPlugin'
    );
    return config;
  },
};

export default nextConfig;
