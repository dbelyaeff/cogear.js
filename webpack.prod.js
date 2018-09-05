const path = require('path');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const postcssConfig = require('./postcss.config.js');

module.exports = merge(common, {
  entry: {
    app: [path.join(cogear.options.src, 'app.js')]
  },
  mode: 'production',
  module: {
    rules: [
      // CSS preprocessors
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          MiniCssExtractPlugin.loader,
          //"vue-style-loader",
          // "cache-loader",
          { loader: 'css-loader', options: { importLoaders: 1 } },
          { loader : 'postcss-loader', options: postcssConfig},
          'sass-loader'
        ]
      },
      {
        test: /\.styl$/,
        use: [
          MiniCssExtractPlugin.loader,
          //"vue-style-loader",
          // "cache-loader",
          { loader: 'css-loader', options: { importLoaders: 1 } },
          { loader : 'postcss-loader', options: postcssConfig},
          'stylus-loader'
        ]
      },
      {
        test: /\.less$/,
        use: [
          MiniCssExtractPlugin.loader,
          //"vue-style-loader",
          // "cache-loader",
          { loader: 'css-loader', options: { importLoaders: 1 } },
          { loader : 'postcss-loader', options: {config:postcssConfig}},
          'less-loader'
        ]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].[hash:5].css',
      chunkFilename: '[id].[hash:5].css'
    })
  ],
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        cache: true,
        parallel: true,
        sourceMap: false // set to true if you want JS source maps
      }),
      // new OptimizeCSSAssetsPlugin({
      //   cssProcessor: require('cssnano'),
      //   cssProcessorOptions: { discardComments: { removeAll: true } },
      //   canPrint: true
      // }),
    ]
  }
});
