const merge = require("webpack-merge")
const path = require('path')
var common = require('./webpack.common.js')
const webpack = require('webpack')
const postcssConfig = require('./postcss.config.js')
// const WebpackBrowserPlugin = require("webpack-browser-plugin");
// var hotMiddlewareScript =
// 	"webpack-hot-middleware/client?path=http://localhost:9000/__webpack_hmr&reload=true";

module.exports = (cogear) => { return merge(common(cogear), {
	//"webpack-hot-middleware/client?reload=true",
	// "webpack-dev-server?http://localhost:9000","webpack/hot/dev-server",
	entry: {
		app: [`webpack-dev-server/client?http://${cogear.options.host}:${cogear.options.port}`,"webpack/hot/dev-server",path.join(cogear.options.src,'app')]
	},
	mode: "development",
	devtool: "sourcemap",
	devServer: {
		hot: true,
		compress: true,
		inline: true,
		watchContentBase: true,
		// open: true,
		stats: {
			colors: true,
			hash: false,
			version: false,
			timings: false,
			assets: false,
			chunks: false,
			modules: false,
			reasons: false,
			children: false,
			source: false,
			errors: false,
			errorDetails: false,
			warnings: false,
			publicPath: false
		}
	},
	module: {
		rules: [
			// CSS preprocessors
			{
				test: /\.(sa|sc|c)ss/,
				use: [
					"style-loader",
					"css-loader",
					{ loader : "postcss-loader", options: postcssConfig},
					"sass-loader"
				]
			},
			{
				test: /\.styl/,
				use: [
					"style-loader",
					"css-loader",
					{ loader : "postcss-loader", options: postcssConfig},
					"stylus-loader"
				]
			},
			{
				test: /\.less/,
				use: [
					"style-loader",
					"css-loader",
					{ loader : "postcss-loader", options: {config:postcssConfig}},
					"less-loader"
				]
			}
		]
	},
	plugins: [
		new webpack.optimize.OccurrenceOrderPlugin(),
		new webpack.HotModuleReplacementPlugin(),
		new webpack.NoEmitOnErrorsPlugin(),
	]
})
}