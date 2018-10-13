const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
const WebpackBar = require('webpackbar');
let plugins = [
  new WebpackBar(),
  new webpack.optimize.OccurrenceOrderPlugin(),
  new webpack.DefinePlugin({
    'cogear':{
      'options': JSON.stringify(cogear.options),
      'config': JSON.stringify(cogear.config),
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
module.exports = {
  context: cogear.baseDir,
  resolve: {
    extensions: ['.js', '.json', '.coffee','.ts'], // File extensions that will be resolved automatically
    alias: {
      '#': path.join(process.cwd(),'/'), // Alias for project root
      '@': cogear.themeDir ? path.join(cogear.themeDir,'/') : '' // Alias for theme root
    },
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
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options:{
          configFile: path.resolve(__dirname, 'tsconfig.json')
          // 'compilerOptions': {
          //   'sourceMap': true,
          //   'noImplicitAny': true,
          //   'module': 'commonjs',
          //   'target': 'es5',
          //   'jsx': 'react',
          //   'allowJs': true
          // },
          // 'include': [
          //   path.join(process.cwd(),'**/*.ts')
          // ],
          // 'exclude': [
          //   path.join(process.cwd(),'**/*.spec.ts')
          // ]
          
          // configFile: fs.existsSync(path.join(process.cwd(),'tsconfig.json')) ? path.join(process.cwd(),'tsconfig.json') : path.join(cogear.baseDir,'tsconfig.json')
        }
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