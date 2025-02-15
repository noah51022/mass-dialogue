const path = require('path');
const webpack = require('webpack'); // Import webpack
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

module.exports = function override(config, env) {

  // Add the NodePolyfillPlugin to the plugins array
  config.plugins = [
    ...(config.plugins || []), // Keep existing plugins
    new NodePolyfillPlugin(),
    new webpack.ProvidePlugin({  // Add ProvidePlugin
      process: 'process/browser',
    }),
  ];

  // Modify the resolve.fallback configuration
  config.resolve = {
    ...config.resolve, // Keep existing resolve configuration
    fallback: {
      "path": require.resolve("path-browserify"),
      "os": require.resolve("os-browserify/browser"),
      "crypto": require.resolve("crypto-browserify"),
      "process": require.resolve("process/browser"), // EXPLICITLY ADD PROCESS
    }
  };

  return config;
};