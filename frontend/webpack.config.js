const {CleanWebpackPlugin} = require("clean-webpack-plugin");
const CompressionPlugin = require("compression-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const MomentLocalesPlugin = require("moment-locales-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const webpack = require("webpack");
const zlib = require("zlib");
const {resolve} = require("path");


module.exports = {
  devtool: "eval-source-map",
  entry: {
    app: resolve(__dirname, "./src/index.tsx"),
  },
  mode: process.env.NODE_ENV ? process.env.NODE_ENV : "production",
  module: {
    rules: [
      {
        test: /\.(ts|js)x?$/,

        exclude: /node_modules\/(?!react-intl|intl-messageformat|@formatjs\/icu-messageformat-parser)/,
        use: ["babel-loader"],
      },
      {
        test: /.*/,
        include: resolve(__dirname, "assets/img"),
        options: {
          context: resolve(__dirname, "assets/"),
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
          "css-loader",
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
    path: resolve(__dirname, "public/"),
    filename: "js/[name]-[contenthash].js",
    chunkFilename: "js/[name]-[contenthash].chunk.js",
  },
  optimization: {
    runtimeChunk: {
      name: "runtime"
    },
    splitChunks: {
      chunks: "all",
      cacheGroups: {
        // disable webpack's default cacheGroup
        default: false,
        // disable webpack's default vendor cacheGroup
        vendors: false,
        // Create a framework bundle that contains React libraries
        // They hardly change so we bundle them together to improve
        framework: {},
        // Big modules that are over 160kb are moved to their own file to
        // optimize browser parsing & execution
        lib: {},
        // All libraries that are used on all pages are moved into a common chunk
        commons: {},
        // When a module is used more than once we create a shared bundle to save user's bandwidth
        shared: {},
        // All CSS is bundled into one stylesheet
        styles: {}
      },
      // Keep maximum initial requests to 25
      maxInitialRequests: 25,
      // A chunk should be at least 20kb before using splitChunks
      minSize: 20000
    },
    minimizer: [
      new CompressionPlugin({
        filename: "[path][base].gz",
        algorithm: "gzip",
        test: /\.js$|\.css$|\.html$/,
        threshold: 10240,
        minRatio: 0.8,
      }),
      new CompressionPlugin({
        filename: "[path][base].br",
        algorithm: "brotliCompress",
        test: /\.(js|css|html|svg)$/,
        compressionOptions: {
          params: {
            [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
          },
        },
        threshold: 10240,
        minRatio: 0.8,
      }),
      new CssMinimizerPlugin(),
      new TerserPlugin(),
    ]
  },
  plugins: [
    // Don"t output new files if there is an error
    new webpack.NoEmitOnErrorsPlugin(),
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: "css/[name].css",
      chunkFilename: "css/[id]-[contenthash].css",
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "assets/img/favicon.ico",
          to: "img",
        },
      ],
    }),
    new HtmlWebpackPlugin({
      filename: resolve(__dirname, '../templates/base.html'),
      inject: false,
      publicPath: "/static/"
    }),
    new MomentLocalesPlugin({
      localesToKeep: ["de", "en"],
    }),
  ],
  resolve: {
    extensions: [".js", ".jsx", ".tsx", ".ts"],
    modules: [
      resolve(__dirname, "src"),
      resolve(__dirname, "node_modules"),
    ],
  },
};
