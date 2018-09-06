const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
const WebpackBar = require('webpackbar');
let plugins = [
  new WebpackBar(),
  // new webpack.DllPlugin({
  // 	path: path.join(cogear.options.output, "[name]-manifest.json"),
  // 	name: "[name]_[hash]"
  // }),
  new webpack.optimize.OccurrenceOrderPlugin(),
  new webpack.DefinePlugin({
    'cogear':{
      'options': JSON.stringify(cogear.options),
      'config': JSON.stringify(cogear.config),
      // 'package': JSON.stringify(cogear.package),
    } 
  }),	
];
if(fs.existsSync(path.join(process.cwd(),'node_modules'))){
  plugins.unshift(new HardSourceWebpackPlugin({
    info: {
      mode: 'none',
      level: 'error'
    },
  }));
}
let resolveModules = [
  path.join(__dirname,'node_modules'),
  path.join(process.cwd(),'node_modules'),
  cogear.options.src
]; 
if(cogear.themeDir){
  resolveModules.unshift(cogear.themeDir);
}
module.exports = {
  context: cogear.baseDir,
  resolve: {
    extensions: ['.js', '.json', '.coffee'], // File extensions that will be resolved automatically
    alias: {
      '#': path.join(process.cwd(),'/'), // Alias for project root
      '@': cogear.themeDir ? path.join(cogear.themeDir,'/') : '' // Alias for theme root
    },
    modules: resolveModules
  },
  resolveLoader:{
    modules: resolveModules
  },
  // Output params
  output: {
    filename(){
      if(cogear.mode === 'development'){
        return '[name].js?[hash:5]';
      }
      return  '[name].[hash:5].js';
    },
    chunkFilename: '.chunks/[name].[hash:5].js',
    hotUpdateChunkFilename: '.hot/[name].[hash:5].js',
    path: cogear.options.output,
    // pathinfo: false,
    // publicPath: '/cdn/'
  },
  module: {
    rules: [
      // Images loaders
      {
        test: /\.svg/,
        use: {
          loader: 'file-loader',
          options: {
            context: process.cwd(),
            limit: 1024*8,
            name () {
              if (cogear.mode === 'development') {
                return '[name].[ext]?[hash:4]';
              }
              return '[name]-[hash:6].[ext]';
            },
            outputPath: 'images/',
            publicPath: '/images/',
          }
        }
      },
      {
        test: /\.(jpe?g|png|gif|ico)$/i,
        use:[
          {
            loader: 'file-loader',
            options: {
              name: '[name]-[hash:6].[ext]',
              outputPath: 'images/',
              publicPath: '/images/',
            }
          },
        ]
      },
      {
        test: /\.(woff|woff2|ttf|eot)$/i,
        use: [{
          loader: 'file-loader',
          options: {
            name () {
              if (cogear.mode === 'development') {
                return '[name].[ext]?[hash:4]';
              }
              return '[name]-[hash:6].[ext]';
            },
            outputPath: 'fonts/',
            publicPath: '/fonts/',
          }
        }],
      },
      // JavaScript preprocessors
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.coffee$/,
        loader: 'babel-loader!coffee-loader',
        exclude: file => (
          /node_modules/.test(file) &&
					!/\.vue\.js/.test(file)
        )
      }
    ]
  },
  plugins,
  node: {
    fs: 'empty'
  },
  externals:[
    require('webpack-require-http')
  ]
};