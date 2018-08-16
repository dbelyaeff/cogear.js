const path = require("path"),
	webpack = require("webpack")
	ManifestPlugin = require("webpack-manifest-plugin"),
	CleanWebpackPlugin = require('clean-webpack-plugin'),
	nodeExternals = require('webpack-node-externals');
	// Exporting a function with Cogear.JS instance as an argument
	module.exports = (cogear)=>{
		let htmlLoaderOptions = {
			ignoreCustomFragments: [/\{\{.*?}}/],
			attrs: ['img:src', 'link:href'],
			// root: cogear.themeDir || path.join(cogear.options.src),
			// minimize: true
		}
		let resolveModules = [cogear.options.src,path.join(process.cwd(),'node_modules'),'node_modules'] 
		if(cogear.themeDir){
			resolveModules.unshift(cogear.themeDir)
		}
		return {
			context: __dirname,
			resolve: {
				extensions: [".js", ".json", ".coffee", ".Vue",".jsx",".pug",".hbs",".ejs",".html"], // File extensions that will be resolved automatically
				alias: {
					"#": path.join(process.cwd(),'/'), // Alias for project root
					"@": cogear.themeDir ? path.join(cogear.themeDir,'/') : '' // Alias for theme root
				},
				modules: resolveModules
			},
			// Output params
			output: {
				filename: "[name].[hash:5].js",
				chunkFilename: ".chunks/[name].[hash:5].js",
				hotUpdateChunkFilename: ".hot/[name].[hash:5].js",
				path: cogear.options.output,
				// publicPath: '/cdn/'
			},
			module: {
				rules: [
					// Images loaders
					{
						test: /\.svg/,
						use: {
								loader: 'url-loader',
								options: {
									limit: 1024*8,
									name: "[name]-[hash:6].[ext]",
									outputPath: 'images',
									publicPath: '/images/',
								}
						}
					},
					{
						test: /\.(jpe?g|png|gif|ico)$/i,
						use:[
							{
								loader: "url-loader",
								options: {
									limit: 8192,
									name: "[name]-[hash:6].[ext]",
									outputPath: 'images',
									publicPath: '/images/',
								}
							},
						]
					},
					{
						test: /\.(woff|woff2|ttf|eot)$/i,
						use: [{
							loader: "url-loader",
							options: {
								limit: 10*1024,
								name: "[name]-[hash:6].[ext]",
								outputPath: '/fonts/',
								publicPath: '/fonts/'
							}
						}],
					},
					// HTML preprocessors
					{
						test: /\.(pug|jade)/,
						use: [{
								loader: "pug-loader",
						}]
					},
					{
						test: /\.md/,
						use: ["json-loader", "yaml-frontmatter-loader"]
					},
					{
						test: /\.html/,
						use: [{
								loader:"html-loader",
								options: htmlLoaderOptions
						}]
					},
					{
						test: /\.hbs/,
						use: [{
								loader:"hbs-loader",
						}]
					},
					{
						test: /\.ejs/,
						use: [
							{
								loader:"ejs-loader",
								options: {
									root: cogear.themeDir || cogear.options.src
								}
						}]
					},
					// JavaScript preprocessors
					{
						test: /\.js/,
						loader: "babel-loader",
						exclude: /node_modules/,
					},
					{
						test: /\.coffee/,
						loader: "babel-loader!coffee-loader",
						exclude: /node_modules/,
					}
				]
			},
			plugins: [
				new CleanWebpackPlugin(cogear.options.output,{verbose: false}),
				new ManifestPlugin(),
				// new webpack.AutomaticPrefetchPlugin(),
				// new webpack.optimize.ModuleConcatenationPlugin(),
				new webpack.DefinePlugin({
					'cogear':{
						'options': JSON.stringify(cogear.options),
						'config': JSON.stringify(cogear.config),
						'package': JSON.stringify(cogear.package),
					} 
				}),			
			],
			optimization: {
				splitChunks: {
					chunks: "async",
					minSize: 30000,
					maxSize: 0,
					minChunks: 1,
					maxAsyncRequests: 5,
					maxInitialRequests: 3,
					automaticNameDelimiter: "~",
					name: true,
					cacheGroups: {
						vendors: {
							test: /[\\/]node_modules[\\/]/,
							priority: -10
						},
						default: {
							minChunks: 2,
							priority: -20,
							reuseExistingChunk: true
						}
					}
				}
			},
			node: {
				fs: "empty"
			},
			externals:[
				require('webpack-require-http')
			]
		}
}