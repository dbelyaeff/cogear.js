const merge = require('webpack-merge');
const path = require('path');
var common = require('./webpack.common.js');
const webpack = require('webpack');
const postcssConfig = require('./postcss.config.js');
module.exports = merge(common, {
  entry: {
    app: [path.join(cogear.baseDir,'lib','hot.js'),path.join(cogear.options.src,'app.js')]
  },
  mode: 'development',
  devtool: 'eval-source-map',
  module: {
    rules: [
      // CSS preprocessors
      {
        test: /\.(sa|sc|c)ss/,
        use: [
          'style-loader',
          'css-loader',
          { loader : 'postcss-loader', options: postcssConfig},
          'sass-loader'
        ]
      },
      {
        test: /\.styl/,
        use: [
          'style-loader',
          'css-loader',
          { loader : 'postcss-loader', options: postcssConfig},
          'stylus-loader'
        ]
      },
      {
        test: /\.less/,
        use: [
          'style-loader',
          'css-loader',
          { loader : 'postcss-loader', options: {config:postcssConfig}},
          'less-loader'
        ]
      }
    ]
  },
  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
  ]
});