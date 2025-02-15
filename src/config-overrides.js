const path = require('path');
const webpack = require('webpack');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

module.exports = function override(config, env) {
  // Add the NodePolyfillPlugin to the plugins array
  config.plugins = [
    ...(config.plugins || []), // Keep existing plugins
    new NodePolyfillPlugin(),
    new webpack.ProvidePlugin({ // Add ProvidePlugin
      process: 'process/browser',
    }),
  ];

  // Modify the resolve.fallback configuration
  config.resolve = {
    ...config.resolve, // Keep existing resolve configuration
    fallback: {
      ...(config.resolve.fallback || {}), // Keep existing fallback configuration
      "path": require.resolve("path-browserify"),
      "os": require.resolve("os-browserify/browser"),
      "crypto": require.resolve("crypto-browserify"),
      "process": require.resolve("process/browser"), // EXPLICITLY ADD PROCESS
    },
  };

  config.module.rules.push({
    test: /\.m?js$/,
    resolve: {
      fullySpecified: false, // disable the behaviour which assumes Javascript ES module files must have extensions
    }
  })
  // Rule to exclude problematic modules from source-map-loader
  config.module.rules.push({
    test: /\.js$/,
    enforce: "pre",
    use: ["source-map-loader"],
    exclude: [
      /node_modules\/@supabase\/realtime-js\/node_modules\/ws/,
      /node_modules\/process\/browser/
    ],
  });

  return config;
};
