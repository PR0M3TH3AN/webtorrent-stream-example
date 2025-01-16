const path = require("path");
const webpack = require("webpack");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  mode: "production",
  entry: path.resolve(__dirname, "src", "webtorrent-bundle.js"),
  output: {
    filename: "webtorrent.bundle.js",
    path: path.resolve(__dirname, "dist"),
    library: {
      name: "WebTorrent",
      type: "umd",
      export: "default",
    },
    globalObject: "this",
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          format: {
            comments: false,
          },
        },
        extractComments: false,
      }),
    ],
  },
  resolve: {
    fallback: {
      stream: require.resolve("stream-browserify"),
      buffer: require.resolve("buffer/"),
      util: require.resolve("util/"),
      crypto: require.resolve("crypto-browserify"),
      path: require.resolve("path-browserify"),
      "process/browser": require.resolve("process/browser"),
      process: require.resolve("process/browser"),
      dns: false,
      net: false,
      tls: false,
      fs: false,
      dgram: false,
      vm: require.resolve("vm-browserify"),
    },
    alias: {
      process: require.resolve("process/browser"),
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        resolve: {
          fullySpecified: false,
        },
      },
    ],
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: ["process/browser"],
      Buffer: ["buffer", "Buffer"],
    }),
    new webpack.DefinePlugin({
      global: "window",
      "process.env.NODE_DEBUG": JSON.stringify(process.env.NODE_DEBUG),
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
    }),
  ],
};
