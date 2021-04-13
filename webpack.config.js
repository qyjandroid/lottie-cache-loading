const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const LottieExtractAssetsWebpackPlugin=require("lottie-extract-assets-plugin");
const copyWebpackPlugin=require("copy-webpack-plugin");

const PUBLIC_PATH = path.resolve(__dirname,  "public");

module.exports = {
  entry: './src/index.js',
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [path.resolve(__dirname,"src")],
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: [
                "@babel/plugin-transform-runtime",
                "@babel/plugin-proposal-class-properties"
            ]
          }
        }
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      title: 'lottie-pre-webpack-plugin',
      template: path.resolve(PUBLIC_PATH, "index.html"),
      inject: "body",
    }),
    new LottieExtractAssetsWebpackPlugin({path:"./lottieConfig.json"}),
    new copyWebpackPlugin({
        patterns: [
            {
                from:path.resolve(PUBLIC_PATH, "js"),
                to:"./js"
            },
            {
                from:path.resolve(PUBLIC_PATH, "css"),
                to:"./css"
            }
        ]
    })
  ]
}