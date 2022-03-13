const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const MomentLocalesPlugin = require("moment-locales-webpack-plugin");
const path = require("path");
const webpack = require("webpack");

module.exports = {
  devtool: "eval-source-map",
  entry: {
    app: path.resolve(__dirname, "./src/index.tsx"),
  },
  mode: process.env.NODE_ENV ? process.env.NODE_ENV : "production",
  module: {
    rules: [
      {
        test: /\.(js)?$/,
        exclude: /node_modules/,
        use: ["babel-loader"],
      },
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: ["babel-loader", "ts-loader"],
      },
      {
        test: /.*/,
        include: path.resolve(__dirname, "assets/img"),
        options: {
          context: path.resolve(__dirname, "assets/"),
          name: "[path][name]-[contenthash].[ext]",
        },
        loader: "file-loader",
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.sass$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
          },
          {
            loader: "sass-loader",
            options: {
              sourceMap: true,
            },
          },
        ],
      },
    ],
  },
  output: {
    path: path.resolve(__dirname, "public/"),
    filename: "js/[name].js",
    chunkFilename: "[id]-[chunkhash].js",
  },
  plugins: [
    // Don"t output new files if there is an error
    new webpack.NoEmitOnErrorsPlugin(),
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: "css/[name].css",
      chunkFilename: "css/[id]-[chunkhash].css",
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "assets/img/favicon.ico",
          to: "img",
        },
      ],
    }),
    // Size reduction
    new MomentLocalesPlugin({
      localesToKeep: ["de-at"],
    }),
  ],
  resolve: {
    extensions: [".js", ".jsx", ".tsx", ".ts"],
    modules: [
      path.resolve(__dirname, "src"),
      path.resolve(__dirname, "node_modules"),
    ],
  },
};
