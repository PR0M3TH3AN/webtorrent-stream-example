/*
<ai_context>
this is a new file
</ai_context>
*/

const path = require("path");

module.exports = {
  mode: "production",
  entry: "./index.js", // adapt this path to your main JS
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "../dist"),
  },
  devtool: "source-map", // avoids eval-based sourcemaps
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: "babel-loader",
        },
      },
    ],
  },
};
